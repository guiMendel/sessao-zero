import {
  Resource,
  ResourcePath,
  Uploadable,
  useResource,
} from '@/api/resources'
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

type Snapshot = { data: () => any; id: string }
type Listener<T> = (newValue: T) => void

export const parseTestSnapshot = (
  id: string,
  data: any
): Resource<ResourcePath> =>
  data && {
    ...data,
    id,
    resourcePath: 'test-resource',
    createdAt: new Date(data.createdAt),
    modifiedAt: new Date(data.modifiedAt),
  }

export const getMockDatabase = (
  values: Record<string, Uploadable<ResourcePath>>
) => {
  const mockSnapshotDatabase: Record<string, Snapshot> = {}

  const docListeners: Record<string, Listener<Snapshot>> = {}

  const databaseListeners: {
    listener: Listener<{ docs: Snapshot[] }>
    query: (snapshots: Snapshot[]) => Snapshot[]
  }[] = []

  const alertListeners = (modifiedId: string) => {
    // Update all listeners
    if (modifiedId in docListeners)
      docListeners[modifiedId](mockSnapshotDatabase[modifiedId])

    for (const { listener, query } of databaseListeners) {
      const queriedSnapshots = query(Object.values(mockSnapshotDatabase))

      // If the updated snapshot is in this query, trigger it
      if (queriedSnapshots.some(({ id }) => id === modifiedId))
        listener({ docs: queriedSnapshots })
    }
  }

  let nextId = 0

  const addDatabaseValue = async (value: Uploadable<ResourcePath>) => {
    const id = (nextId++).toString()

    addSnapshot(id)
    updateDatabaseValue(id, value)

    return mockSnapshotDatabase[id]
  }

  const getDatabaseValue = (id: string) =>
    parseTestSnapshot(id, mockSnapshotDatabase[id]?.data())

  const indexDatabaseValues = (): Resource<ResourcePath>[] =>
    Object.entries(mockSnapshotDatabase).map(([id, value]) =>
      parseTestSnapshot(id, value.data())
    )

  const updateDatabaseValue = (id: string, newValue: any) => {
    values[id] = {
      ...values[id],
      ...newValue,
    }

    alertListeners(id)
  }

  const hasListener = (id: string) => id in docListeners

  const hasListListener = () => databaseListeners.length > 0

  // Inicializa a database
  const addSnapshot = (id: string) =>
    (mockSnapshotDatabase[id] = {
      data: () => values[id],
      id: id,
    })

  for (const id in values) addSnapshot(id)

  // Simplifica os docs
  mockDoc.mockImplementation((_, id) => id)

  mockWhere.mockImplementation(
    (property: string, _: '==', value: string | boolean | number) =>
      (snapshots: Snapshot[]) =>
        snapshots.filter((snapshot) => snapshot.data()[property] === value)
  )

  mockQuery.mockImplementation(
    (_, ...filters: ((snapshots: Snapshot[]) => Snapshot[])[]) =>
      (snapshots: Snapshot[]) =>
        filters.reduce(
          (filteredSnapshots, filter) => filter(filteredSnapshots),
          snapshots
        )
  )

  // Sobrescreve snapshots
  mockOnSnapshot.mockImplementation(
    (
      query: string | ((snapshots: Snapshot[]) => Snapshot[]),
      rawListener: Listener<Snapshot> | Listener<{ docs: Snapshot[] }>
    ) => {
      // Se for de um doc so
      if (typeof query === 'string') {
        const listener = rawListener as Listener<Snapshot>

        // Adiciona o listener
        docListeners[query] = listener

        // Ja inicializa ele
        listener(mockSnapshotDatabase[query])

        return vi.fn().mockImplementation(() => {
          delete docListeners[query]
        })
      }

      // Se for do database inteiro
      const listener = rawListener as Listener<{ docs: Snapshot[] }>

      // Adiciona o listener
      databaseListeners.push({ listener, query })

      // Ja inicializa ele
      listener({ docs: query(Object.values(mockSnapshotDatabase)) })

      return vi.fn().mockImplementation(() => {
        const targetIndex = databaseListeners.findIndex(
          ({ listener: storedListener }) => storedListener === listener
        )

        databaseListeners.splice(targetIndex, 1)
      })
    }
  )

  mockAddDoc.mockImplementation((_, properties: Uploadable<ResourcePath>) =>
    addDatabaseValue(properties)
  )

  mockUpdateDoc.mockImplementation(updateDatabaseValue)

  mockDeleteDoc.mockImplementation((id: string) => {
    delete mockSnapshotDatabase[id]
    delete values[id]
  })

  mockSetDoc.mockImplementation(
    async (id: string, value: Uploadable<ResourcePath>) => {
      addSnapshot(id)

      values[id] = {
        ...value,
        createdAt: values[id]?.createdAt ?? new Date().toJSON(),
        modifiedAt: new Date().toJSON(),
      }

      alertListeners(id)
    }
  )

  mockGetDoc.mockImplementation(async (id: string) => mockSnapshotDatabase[id])

  mockGetDocs.mockImplementation(
    async (query?: (snapshots: Snapshot[]) => Snapshot[]) => ({
      docs: query
        ? query(Object.values(mockSnapshotDatabase))
        : Object.values(mockSnapshotDatabase),
    })
  )

  return {
    getDatabaseValue,
    indexDatabaseValues,
    updateDatabaseValue,
    mockSnapshotDatabase,
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
