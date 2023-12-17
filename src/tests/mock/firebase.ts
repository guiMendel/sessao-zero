import {
  ManyToManySettings,
  ManyToManyTable,
  Resource,
  ResourcePath,
  Uploadable,
  resourcePaths,
} from '@/api/resources'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Mock } from 'vitest'

vi.mock('@/api/firebase', () => ({ db: 'mockDb' }))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  where: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  documentId: vi.fn(),
}))

export const mockGetDocs = getDocs as Mock
export const mockGetDoc = getDoc as Mock
export const mockSetDoc = setDoc as Mock
export const mockDeleteDoc = deleteDoc as Mock
export const mockUpdateDoc = updateDoc as Mock
export const mockAddDoc = addDoc as Mock
export const mockDoc = doc as Mock
export const mockOnSnapshot = onSnapshot as Mock
export const mockCollection = collection as Mock
export const mockQuery = query as Mock
export const mockWhere = where as Mock
export const mockDocumentId = documentId as Mock

type DatabaseTable = ResourcePath | ManyToManyTable

type ManyToManyEntry<P extends ManyToManyTable> = {
  [key in ManyToManySettings[P][number]]: string
}

type EntryFor<P extends DatabaseTable> = P extends ResourcePath
  ? Uploadable<P>
  : P extends ManyToManyTable
  ? ManyToManyEntry<P>
  : never

type ExternalEntryFor<P extends DatabaseTable> = P extends ResourcePath
  ? Resource<P>
  : P extends ManyToManyTable
  ? ManyToManyEntry<P>
  : never

type Snapshot<P extends DatabaseTable> = {
  data: () => EntryFor<P> | undefined
  id: string
}

type Database = Partial<{
  [P in DatabaseTable]: Record<string, EntryFor<P>>
}>

type Listener<T> = (newValue: T | undefined) => void

const isResourcePath = (path: DatabaseTable): path is ResourcePath =>
  resourcePaths.includes(path as any)

export const getMockDatabase = (values: Database) => {
  const database: Database = { ...values }

  const docListeners: Partial<{
    [P in ResourcePath]: Record<string, Listener<Snapshot<P>>>
  }> = {}

  const databaseListeners: Partial<{
    [P in DatabaseTable]: {
      listener: Listener<{ docs: Snapshot<P>[] }>
      query: (snapshots: Snapshot<P>[]) => Snapshot<P>[]
    }[]
  }> = {}

  let nextId = 0

  const parseTestSnapshot = <P extends ResourcePath>(
    path: P,
    id: string,
    data: Uploadable<P>
  ): Resource<P> =>
    data && {
      ...data,
      id,
      resourcePath: path,
      createdAt: new Date(data.createdAt),
      modifiedAt: new Date(data.modifiedAt),
    }

  const lookupDatabase = <P extends DatabaseTable>(
    path: P,
    id: string
  ): EntryFor<P> | undefined => {
    const pathDatabase = database[path]

    return pathDatabase ? pathDatabase[id] : undefined
  }

  const toSnapshot = <P extends ResourcePath>(
    path: P,
    id: string
  ): Snapshot<P> => ({
    data: () => lookupDatabase(path, id),
    id,
  })

  const allSnapshots = <P extends ResourcePath>(path: P): Snapshot<P>[] =>
    Object.keys(database[path] ?? {}).map((id) => toSnapshot(path, id))

  const alertListeners = <P extends ResourcePath>(
    path: P,
    modifiedId: string
  ) => {
    // Update all listeners
    const docPathListeners = docListeners[path]

    if (docPathListeners && modifiedId in docPathListeners)
      docPathListeners[modifiedId](toSnapshot(path, modifiedId))

    const databasePathListeners = databaseListeners[path]

    if (databasePathListeners) {
      for (const { listener, query } of databasePathListeners) {
        const queriedSnapshots = query(allSnapshots(path))

        // If the updated snapshot is in this query, trigger it
        if (queriedSnapshots.some(({ id }) => id === modifiedId))
          listener({ docs: queriedSnapshots })
      }
    }
  }

  const updateDatabaseValue = async <P extends ResourcePath>(
    path: P,
    id: string,
    newValue: Partial<Uploadable<P>>
  ) => {
    if (database[path] == undefined) database[path] = {}

    const pathDatabase = database[path]

    if (pathDatabase == undefined) throw new Error('wtf just happened')

    pathDatabase[id] = {
      ...pathDatabase[id],
      ...newValue,
    }

    alertListeners(path, id)
  }

  const addDatabaseValue = async <P extends ResourcePath>(
    path: P,
    value: Uploadable<P>
  ) => {
    const id = (nextId++).toString()

    updateDatabaseValue(path, id, value)

    return toSnapshot(path, id)
  }

  const getDatabaseValue = async <P extends ResourcePath>(
    path: P,
    id: string
  ) => {
    const value = lookupDatabase(path, id)

    return value == undefined
      ? undefined
      : parseTestSnapshot(path, id, value as Uploadable<P>)
  }

  async function indexDatabaseValues<P extends ResourcePath>(
    path: P
  ): Promise<Resource<P>[]>

  async function indexDatabaseValues<P extends ManyToManyTable>(
    path: P
  ): Promise<ManyToManyEntry<P>[]>

  async function indexDatabaseValues<P extends DatabaseTable>(
    path: P
  ): Promise<ExternalEntryFor<P>[]> {
    const pathDatabase = database[path]

    if (pathDatabase == undefined) return []

    if (isResourcePath(path))
      return Object.entries(pathDatabase).map(
        ([id, data]) => parseTestSnapshot(path, id, data as any) as any
      )

    return Object.values(pathDatabase).map((data) => data as any)
  }

  const hasListener = <P extends ResourcePath>(path: P, id: string) => {
    const pathListeners = docListeners[path]

    return pathListeners != undefined && id in pathListeners
  }

  const hasListListener = <P extends ResourcePath>(path: P) => {
    const pathListeners = databaseListeners[path]

    return pathListeners != undefined && pathListeners.length > 0
  }

  type DocumentIdSentinel = { sentinel: 'documentId' }

  mockDocumentId.mockReturnValue({
    sentinel: 'documentId',
  } as DocumentIdSentinel)

  mockCollection.mockImplementation((_, path) => path)

  // Simplifica os docs
  type MockedDoc = { path: ResourcePath; id: string }

  mockDoc.mockImplementation((path, id): MockedDoc => ({ path, id }))

  mockWhere.mockImplementation(
    (
      property: keyof Uploadable<ResourcePath> | DocumentIdSentinel,
      operation: '==' | 'in',
      value: string | boolean | number | any[]
    ): ((snapshots: Snapshot<ResourcePath>[]) => Snapshot<ResourcePath>[]) => {
      const getTarget = (snapshot: Snapshot<ResourcePath>) =>
        typeof property === 'string' ? snapshot.data()?.[property] : snapshot.id

      switch (operation) {
        case '==':
          return (snapshots) =>
            snapshots.filter((snapshot) => getTarget(snapshot) === value)

        case 'in':
          return (snapshots) =>
            snapshots.filter((snapshot) =>
              (value as any[]).includes(getTarget(snapshot))
            )

        default:
          const exhaustiveCheck: never = operation
          return exhaustiveCheck
      }
    }
  )

  type MockedQuery = {
    path: ResourcePath
    filter: (snapshots: Snapshot<ResourcePath>[]) => Snapshot<ResourcePath>[]
  }

  mockQuery.mockImplementation(
    (
      path: ResourcePath,
      ...filters: ((
        snapshots: Snapshot<ResourcePath>[]
      ) => Snapshot<ResourcePath>[])[]
    ): MockedQuery => ({
      path,
      filter: (snapshots: Snapshot<ResourcePath>[]) =>
        filters.reduce(
          (filteredSnapshots, filter) => filter(filteredSnapshots),
          snapshots
        ),
    })
  )

  // Sobrescreve snapshots
  mockOnSnapshot.mockImplementation(
    (
      query: MockedDoc | MockedQuery,
      rawListener:
        | Listener<Snapshot<ResourcePath>>
        | Listener<{ docs: Snapshot<ResourcePath>[] }>
    ) => {
      // Se for de um doc so
      if ('id' in query) {
        const { id, path } = query

        const listener = rawListener as Listener<Snapshot<ResourcePath>>

        // Adiciona o listener
        if (docListeners[path] == undefined) docListeners[path] = {}

        const pathListeners = docListeners[path]

        if (pathListeners == undefined)
          throw new Error('Impossible! How can this be??')

        pathListeners[id] = listener

        // Ja inicializa ele
        listener(toSnapshot(path, id))

        return vi.fn().mockImplementation(() => {
          if (docListeners[path]) delete docListeners[path]![id]
        })
      }

      const { filter, path } = query

      // Se for do database inteiro
      const listener = rawListener as Listener<{
        docs: Snapshot<DatabaseTable>[]
      }>

      // Adiciona o listener
      if (databaseListeners[path] == undefined) databaseListeners[path] = []

      const pathListeners = databaseListeners[path]

      if (pathListeners == undefined)
        throw new Error('Impossible (with query)! How can this be??')

      pathListeners.push({ listener, query: filter as any })

      // Ja inicializa ele
      listener({ docs: filter(allSnapshots(path)) })

      return vi.fn().mockImplementation(() => {
        if (databaseListeners[path] == undefined) return

        const targetIndex = databaseListeners[path]!.findIndex(
          ({ listener: storedListener }) => storedListener === listener
        )

        databaseListeners[path]!.splice(targetIndex, 1)
      })
    }
  )

  mockAddDoc.mockImplementation(addDatabaseValue)

  mockUpdateDoc.mockImplementation(async ({ id, path }: MockedDoc, data) =>
    updateDatabaseValue(path, id, data)
  )

  mockDeleteDoc.mockImplementation(async ({ id, path }: MockedDoc) => {
    if (database[path] != undefined) delete database[path]![id]
  })

  mockSetDoc.mockImplementation(async ({ id, path }: MockedDoc, data) => {
    if (database[path] == undefined) database[path] = {}

    const pathDatabase = database[path]

    if (pathDatabase == undefined) throw new Error('wtf just happened')

    pathDatabase[id] = {
      ...data,
      createdAt: data[id]?.createdAt ?? new Date().toJSON(),
      modifiedAt: new Date().toJSON(),
    }

    alertListeners(path, id)
  })

  mockGetDoc.mockImplementation(async ({ id, path }: MockedDoc) =>
    toSnapshot(path, id)
  )

  mockGetDocs.mockImplementation(async ({ filter, path }: MockedQuery) => ({
    docs: filter(allSnapshots(path)),
  }))

  return {
    getDatabaseValue,
    indexDatabaseValues,
    updateDatabaseValue,
    hasListener,
    hasListListener,
    toSnapshot,
    allSnapshots,
  }
}

export const mockDate = '2019-04-22T10:20:30Z'
export const RealDate = Date

beforeEach(() => {
  vitest.restoreAllMocks()

  global.Date = vi
    .fn()
    .mockReturnValue(new Date(mockDate)) as unknown as DateConstructor

  mockDoc.mockImplementation((collection, id) => ({ collection, id }))
  mockOnSnapshot.mockReturnValue({})
  mockCollection.mockImplementation((db, name) => ({ name, db }))
  mockQuery.mockReturnValue(vitest.fn())
})

afterEach(() => {
  global.Date = RealDate
})
