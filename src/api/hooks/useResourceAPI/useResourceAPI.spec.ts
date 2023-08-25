import { Resource, Uploadable } from '@/types'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { Mock } from 'vitest'
import { onBeforeUnmount, ref } from 'vue'
import { useResourceAPI } from '.'

vi.mock('@/api', () => ({ db: 'mockDb' }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  where: vi.fn(),
}))

vi.mock('vue', async () => ({
  ...(await vi.importActual<{}>('vue')),
  onBeforeUnmount: vi.fn(),
}))

const mockDoc = doc as Mock
const mockOnSnapshot = onSnapshot as Mock
const mockCollection = collection as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock
const mockOnBeforeUnmount = onBeforeUnmount as Mock

interface TestResource extends Resource {
  name: string
  count: number
}

type Snapshot = { data: () => any; id: string }
type Listener<T> = (newValue: T) => void

const parseTestSnapshot = (uid: string, data: any) => ({
  count: data.count,
  name: data.name,
  uid,
  createdAt: new Date(data.createdAt),
  modifiedAt: new Date(data.modifiedAt),
})

const useTestResourceAPI = () =>
  useResourceAPI<TestResource>('test-resource', parseTestSnapshot)

const mockDatabase = (values: Record<string, Uploadable<TestResource>>) => {
  const mockSnapshotDatabase: Record<string, Snapshot> = {}
  const docListeners: Record<string, Listener<Snapshot>> = {}
  const databaseListeners: {
    listener: Listener<{ docs: Snapshot[] }>
    query: (snapshots: Snapshot[]) => Snapshot[]
  }[] = []

  // Inicializa a database
  for (const uid in values)
    mockSnapshotDatabase[uid] = {
      data: () => values[uid],
      id: uid,
    }

  // Simplifica os docs
  mockDoc.mockImplementation((_, uid) => uid)

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

  const getDatabaseValue = (uid: string) =>
    parseTestSnapshot(uid, mockSnapshotDatabase[uid].data())

  const indexDatabaseValues = (): TestResource[] =>
    Object.entries(mockSnapshotDatabase).map(([uid, value]) =>
      parseTestSnapshot(uid, value.data())
    )

  const updateDatabaseValue = (
    uid: string,
    newValue: Partial<Uploadable<TestResource>>
  ) => {
    values[uid] = {
      ...values[uid],
      ...newValue,
      modifiedAt: new Date().toJSON(),
    }

    // Update all listeners
    for (const [uid, listener] of Object.entries(docListeners))
      listener(mockSnapshotDatabase[uid])

    for (const { listener, query } of databaseListeners) {
      const queriedSnapshots = query(Object.values(mockSnapshotDatabase))

      // If the updated snapshot is inthis query, trigger it
      if (queriedSnapshots.some(({ id }) => id === uid))
        listener({ docs: queriedSnapshots })
    }
  }

  return {
    getDatabaseValue,
    indexDatabaseValues,
    updateDatabaseValue,
    mockSnapshotDatabase,
    docListeners,
  }
}

describe('useResourceAPI', () => {
  beforeEach(() => {
    vitest.restoreAllMocks()

    mockDoc.mockImplementation((collection, uid) => ({ collection, uid }))
    mockOnSnapshot.mockReturnValue({})
    mockCollection.mockImplementation((db, name) => ({ name, db }))
    mockQuery.mockReturnValue(vitest.fn())
  })

  describe('syncResource', () => {
    it('should return the same ref that was provided as second argument', () => {
      const resourceId = '1'

      const existingRef = ref<TestResource>({
        count: 1,
        name: 'scooby',
        createdAt: new Date(),
        modifiedAt: new Date(),
        uid: resourceId,
      })

      const { syncResource } = useTestResourceAPI()

      expect(syncResource(resourceId, existingRef)).toBe(existingRef)
    })

    it('should sync current call and desync any previous calls', () => {
      const uid1 = '1'
      const uid2 = '2'

      const { getDatabaseValue, updateDatabaseValue } = mockDatabase({
        [uid1]: {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
        [uid2]: {
          name: 'snacks',
          count: 5,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { syncResource } = useTestResourceAPI()

      const instance1 = syncResource(uid1)
      const instance2 = syncResource(uid2)

      const oldValue = instance1.value

      // Ensures it initializes properly
      expect(instance1.value).toStrictEqual(getDatabaseValue(uid1))
      expect(instance1.value).toStrictEqual(oldValue)
      expect(instance2.value).toHaveProperty('count', 5)
      expect(instance2.value).toStrictEqual(getDatabaseValue(uid2))

      updateDatabaseValue(uid1, { count: 10 })
      updateDatabaseValue(uid2, { count: 10 })

      // Ensures it synced properly
      expect(instance1.value).not.toStrictEqual(getDatabaseValue(uid1))
      expect(instance1.value).toStrictEqual(oldValue)
      expect(instance2.value).toHaveProperty('count', 10)
      expect(instance2.value).toStrictEqual(getDatabaseValue(uid2))
    })

    it('should no longer update a ref when desyncResource is called', () => {
      const testUid = '1'

      const { getDatabaseValue, updateDatabaseValue } = mockDatabase({
        [testUid]: {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { syncResource, desyncResource } = useTestResourceAPI()

      const instance = syncResource(testUid)

      const oldValue = instance.value

      // Ensures it initializes properly
      expect(instance.value).toStrictEqual(getDatabaseValue(testUid))
      expect(instance.value).not.toHaveProperty('count', 10)
      expect(instance.value).toStrictEqual(oldValue)

      desyncResource()

      updateDatabaseValue(testUid, { count: 10 })

      // Ensures it synced properly
      expect(instance.value).not.toHaveProperty('count', 10)
      expect(instance.value).toStrictEqual(oldValue)
    })
  })

  describe('syncedResourceList', () => {
    it('should sync to database content', () => {
      const { indexDatabaseValues, updateDatabaseValue } = mockDatabase({
        '1': {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
        '2': {
          name: 'snacks',
          count: 5,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { syncedResourceList } = useTestResourceAPI()

      // Verifica se inicializa adequadamente
      expect(syncedResourceList.value).toStrictEqual(indexDatabaseValues())

      updateDatabaseValue('2', { count: 10 })

      expect(syncedResourceList.value).toStrictEqual(indexDatabaseValues())
    })

    it('should update list to match new query when filterResourceList is called', async () => {
      const { indexDatabaseValues } = mockDatabase({
        '1': {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
        '2': {
          name: 'snacks',
          count: 5,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { syncedResourceList, filterResourceList } = useTestResourceAPI()

      // Verifica se inicializa adequadamente
      expect(syncedResourceList.value).toStrictEqual(indexDatabaseValues())

      const expectedResult = indexDatabaseValues().filter(
        ({ count }) => count === 5
      )

      const result = await filterResourceList(where('count', '==', 5))

      expect(result).toStrictEqual(expectedResult)
      expect(syncedResourceList.value).toStrictEqual(result)
      expect(syncedResourceList.value).not.toStrictEqual(indexDatabaseValues())
    })
  })

  it('should get the correct doc when getResourceDocRef is called', () => {
    const { getResourceDocRef, resourceCollection } = useTestResourceAPI()

    const uid = 'scooby'

    expect(getResourceDocRef(uid)).toStrictEqual(
      mockDoc(resourceCollection, uid)
    )
  })

  it('should provide the correct collection with resourceCollection', () => {
    const { resourceCollection } = useTestResourceAPI()

    expect(resourceCollection).toEqual(
      mockCollection('mockDb', 'test-resource')
    )
  })

  it('should unsubscribe everything on unmount', () => {
    let unmount = () => {}

    mockOnBeforeUnmount.mockImplementation((callback) => (unmount = callback))

    const instanceUid = '1'

    const { getDatabaseValue, updateDatabaseValue, indexDatabaseValues } =
      mockDatabase({
        [instanceUid]: {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
        '2': {
          name: 'snacks',
          count: 5,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

    const { syncResource, syncedResourceList } = useTestResourceAPI()

    const instance = syncResource(instanceUid)

    const oldInstance = instance.value
    const oldList = syncedResourceList.value

    expect(instance.value).toStrictEqual(getDatabaseValue(instanceUid))
    expect(instance.value).toStrictEqual(oldInstance)
    expect(syncedResourceList.value).toStrictEqual(indexDatabaseValues())
    expect(syncedResourceList.value).toStrictEqual(oldList)

    unmount()

    updateDatabaseValue(instanceUid, { count: 50 })

    expect(instance.value).not.toStrictEqual(getDatabaseValue(instanceUid))
    expect(instance.value).toStrictEqual(oldInstance)
    expect(syncedResourceList.value).not.toStrictEqual(indexDatabaseValues())
    expect(syncedResourceList.value).toStrictEqual(oldList)
  })
})
