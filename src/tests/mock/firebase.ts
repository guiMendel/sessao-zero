import { Resource, ResourcePath, Uploadable } from '@/api/resources'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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

type Snapshot<P extends ResourcePath> = {
  data: () => Uploadable<P> | undefined
  id: string
}

type Database = Partial<{
  [P in ResourcePath]: Record<string, Uploadable<P>>
}>

type Listener<T> = (newValue: T | undefined) => void

export const getMockDatabase = (values: Database) => {
  const database: Database = { ...values }

  const docListeners: Partial<{
    [P in ResourcePath]: Record<string, Listener<Snapshot<P>>>
  }> = {}

  const databaseListeners: Partial<{
    [P in ResourcePath]: {
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

  const lookupDatabase = <P extends ResourcePath>(
    path: P,
    id: string
  ): Uploadable<P> | undefined => {
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

    if (value == undefined) return undefined

    parseTestSnapshot(path, id, value)
  }

  const indexDatabaseValues = async <P extends ResourcePath>(
    path: P
  ): Promise<Resource<P>[]> => {
    const pathDatabase = database[path]

    if (pathDatabase == undefined) return []

    return Object.entries(pathDatabase).map(([id, data]) =>
      parseTestSnapshot(path, id, data)
    )
  }

  const hasListener = <P extends ResourcePath>(path: P, id: string) => {
    const pathListeners = docListeners[path]

    return pathListeners != undefined && id in pathListeners
  }

  const hasListListener = <P extends ResourcePath>(path: P) => {
    const pathListeners = databaseListeners[path]

    return pathListeners != undefined && pathListeners.length > 0
  }

  mockCollection.mockImplementation((_, path) => path)

  // Simplifica os docs
  type MockedDoc = { path: ResourcePath; id: string }

  mockDoc.mockImplementation((path, id): MockedDoc => ({ path, id }))

  mockWhere.mockImplementation(
    (
        property: keyof Uploadable<ResourcePath>,
        _: '==',
        value: string | boolean | number
      ) =>
      (snapshots: Snapshot<ResourcePath>[]) =>
        snapshots.filter((snapshot) => snapshot.data()?.[property] === value)
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
        docs: Snapshot<ResourcePath>[]
      }>

      // Adiciona o listener
      if (databaseListeners[path] == undefined) databaseListeners[path] = []

      const pathListeners = databaseListeners[path]

      if (pathListeners == undefined)
        throw new Error('Impossible with query! How can this be??')

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

  mockUpdateDoc.mockImplementation(({ id, path }: MockedDoc, data) =>
    updateDatabaseValue(path, id, data)
  )

  mockDeleteDoc.mockImplementation(({ id, path }: MockedDoc) => {
    if (database[path] != undefined) delete database[path]![id]
  })

  mockSetDoc.mockImplementation(({ id, path }: MockedDoc, data) => {
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

  mockGetDoc.mockImplementation(({ id, path }: MockedDoc) =>
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
