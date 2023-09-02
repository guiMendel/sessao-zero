import { Resource, Uploadable } from '@/types'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Mock } from 'vitest'
import { Ref, onBeforeUnmount, ref } from 'vue'
import {
  desyncedReadErrorMessage,
  desyncedWriteErrorMessage,
  useResourceAPI,
} from '.'

vi.mock('@/api', () => ({ db: 'mockDb' }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  where: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}))

vi.mock('vue', async () => ({
  ...(await vi.importActual<{}>('vue')),
  onBeforeUnmount: vi.fn(),
}))

const mockDeleteDoc = deleteDoc as Mock
const mockUpdateDoc = updateDoc as Mock
const mockAddDoc = addDoc as Mock
const mockDoc = doc as Mock
const mockOnSnapshot = onSnapshot as Mock
const mockCollection = collection as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock
const mockOnBeforeUnmount = onBeforeUnmount as Mock

interface TestResource extends Resource {
  name: string
  count: number
  password?: string
  id: string
}

type Snapshot = { data: () => any; id: string }
type Listener<T> = (newValue: T) => void

const parseTestSnapshot = (id: string, data: any) =>
  data && {
    count: data.count,
    name: data.name,
    id,
    createdAt: new Date(data.createdAt),
    modifiedAt: new Date(data.modifiedAt),
  }

const useTestResourceAPI = () =>
  useResourceAPI<TestResource>('test-resource', parseTestSnapshot)

const mockDatabase = (values: Record<string, Uploadable<TestResource>>) => {
  const mockSnapshotDatabase: Record<string, Snapshot> = {}
  const docListeners: Record<string, Listener<Snapshot>> = {}
  const databaseListeners: {
    listener: Listener<{ docs: Snapshot[] }>
    query: (snapshots: Snapshot[]) => Snapshot[]
  }[] = []

  const addDatabaseValue = (value: Uploadable<TestResource>) => {
    const id = Object.keys(values).length.toString()

    addSnapshot(id)
    updateDatabaseValue(id, value)
  }

  const getDatabaseValue = (id: string) =>
    parseTestSnapshot(id, mockSnapshotDatabase[id]?.data())

  const indexDatabaseValues = (): TestResource[] =>
    Object.entries(mockSnapshotDatabase).map(([id, value]) =>
      parseTestSnapshot(id, value.data())
    )

  const updateDatabaseValue = (
    id: string,
    newValue: Partial<Uploadable<TestResource>>
  ) => {
    values[id] = {
      ...values[id],
      ...newValue,
    }

    // Update all listeners
    if (id in docListeners) docListeners[id](mockSnapshotDatabase[id])

    for (const { listener, query } of databaseListeners) {
      const queriedSnapshots = query(Object.values(mockSnapshotDatabase))

      // If the updated snapshot is in this query, trigger it
      if (queriedSnapshots.some(({ id }) => id === id))
        listener({ docs: queriedSnapshots })
    }
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

  mockAddDoc.mockImplementation((_, properties: Uploadable<TestResource>) =>
    addDatabaseValue(properties)
  )

  mockUpdateDoc.mockImplementation(updateDatabaseValue)

  mockDeleteDoc.mockImplementation((id: string) => {
    delete mockSnapshotDatabase[id]
    delete values[id]
  })

  return {
    getDatabaseValue,
    indexDatabaseValues,
    updateDatabaseValue,
    mockSnapshotDatabase,
    hasListener,
    hasListListener,
  }
}

const mockDate = '2019-04-22T10:20:30Z'
const RealDate = Date

describe('useResourceAPI', () => {
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

  describe('creating', () => {
    it('should not upload password or id, and should override modifiedAt and createdAt', () => {
      const properties: TestResource = {
        count: 1,
        id: '1',
        name: 'scooby',
        password: '123',
        createdAt: new RealDate(1999, 6),
        modifiedAt: new RealDate(1999, 6),
      }

      const { create } = useTestResourceAPI()

      create(properties)

      const [, uploadedProperties] = mockAddDoc.mock.calls[0]

      expect(uploadedProperties).toStrictEqual({
        count: properties.count,
        name: properties.name,
        createdAt: new Date().toJSON(),
        modifiedAt: new Date().toJSON(),
      })
    })

    it('should add the doc with the provided properties', () => {
      const properties = {
        count: 1,
        name: 'scooby',
      }

      const { indexDatabaseValues } = mockDatabase({})

      const { create } = useTestResourceAPI()

      create(properties)

      expect(indexDatabaseValues()[0]).toStrictEqual(
        expect.objectContaining(properties)
      )
    })
  })

  describe('updating', () => {
    it('should not upload password, createdAt or id, and correctly update the modifiedAt property', () => {
      const properties = {
        count: 10,
        id: '25',
        name: 'shaggy',
        password: '123',
        createdAt: new RealDate(1999, 6),
        modifiedAt: new RealDate(1999, 6),
      }

      const realId = '1'

      const { update } = useTestResourceAPI()

      update(realId, properties)

      const [{ id: calledId }, uploadedProperties] = mockUpdateDoc.mock.calls[0]

      expect(calledId).toBe(realId)

      expect(uploadedProperties).toStrictEqual({
        count: properties.count,
        name: properties.name,
        modifiedAt: new Date().toJSON(),
      })
    })

    it('should update the doc with the provided properties', () => {
      const originalProperties = {
        count: 1,
        name: 'scooby',
      }

      const newProperties = {
        count: 10,
        name: 'shaggy',
      }

      const id = '1'

      const { getDatabaseValue } = mockDatabase({
        [id]: {
          ...originalProperties,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { update } = useTestResourceAPI()

      update(id, newProperties)

      expect(getDatabaseValue(id)).toStrictEqual(
        expect.objectContaining(newProperties)
      )
    })
  })

  describe('syncing single', () => {
    describe('syncing', () => {
      it('should sync current call', () => {
        const id = '1'

        const { getDatabaseValue, updateDatabaseValue } = mockDatabase({
          [id]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync } = useTestResourceAPI()

        const instance = sync(id)

        // Ensures it initializes properly
        expect(instance.value).toStrictEqual(getDatabaseValue(id))

        updateDatabaseValue(id, { count: 10 })

        // Ensures it synced properly
        expect(instance.value).toStrictEqual(getDatabaseValue(id))
      })

      it('should also sync the provided ref', () => {
        const id = '1'

        const { getDatabaseValue, updateDatabaseValue } = mockDatabase({
          [id]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync } = useTestResourceAPI()

        const instanceRef = ref<TestResource | null>(null)

        sync(id, instanceRef)

        // Ensures it initializes properly
        expect(instanceRef.value).toStrictEqual(getDatabaseValue(id))

        updateDatabaseValue(id, { count: 10 })

        // Ensures it synced properly
        expect(instanceRef.value).toStrictEqual(getDatabaseValue(id))
      })
    })

    describe('desyncing', () => {
      it('should throw when reading form desynced value', () => {
        const testId = '1'

        const { getDatabaseValue, hasListener } = mockDatabase({
          [testId]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync, desync } = useTestResourceAPI()

        const instance = sync(testId)

        // Ensures it initializes properly
        expect(instance.value).toStrictEqual(getDatabaseValue(testId))
        expect(hasListener(testId)).toBeTruthy()

        desync()

        expect(() => instance.value).toThrow(desyncedReadErrorMessage)
        expect(hasListener(testId)).toBeFalsy()
      })

      it('should desync previous calls to sync', () => {
        const testId = '1'

        const { getDatabaseValue, hasListener } = mockDatabase({
          [testId]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync } = useTestResourceAPI()

        const instance = sync(testId)

        // Ensures it initializes properly
        expect(instance.value).toStrictEqual(getDatabaseValue(testId))
        expect(hasListener(testId)).toBeTruthy()

        sync(testId)

        expect(() => instance.value).toThrow(desyncedReadErrorMessage)
        expect(hasListener(testId)).toBeTruthy()
      })
    })

    describe('writing', () => {
      it('should throw when writing to desynced', () => {
        const testId = '1'

        const { getDatabaseValue } = mockDatabase({
          [testId]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync, desync } = useTestResourceAPI()

        const instance = sync(testId)

        const oldValue = instance.value

        // Ensures it initializes properly
        expect(oldValue).toStrictEqual(getDatabaseValue(testId))

        desync()

        expect(() => (instance.value = { count: 10 } as TestResource)).toThrow(
          desyncedWriteErrorMessage
        )

        // Ensures nothing changed
        expect(getDatabaseValue(testId)).toStrictEqual(oldValue)
      })

      it('should desync when writing null', () => {
        const testId = '1'

        const { getDatabaseValue } = mockDatabase({
          [testId]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync } = useTestResourceAPI()

        const instance = sync(testId)

        const oldValue = instance.value

        // Ensures it initializes properly
        expect(oldValue).toStrictEqual(getDatabaseValue(testId))

        instance.value = null

        expect(() => instance.value).toThrow(desyncedReadErrorMessage)
      })

      it('should update with valid data', () => {
        const testId = '1'

        const { getDatabaseValue } = mockDatabase({
          [testId]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync } = useTestResourceAPI()

        const instance = sync(testId)

        // Ensures it initializes properly
        expect(instance.value).toStrictEqual(getDatabaseValue(testId))

        instance.value = { ...instance.value!, count: 10 }

        expect(instance.value).toHaveProperty('count', 10)
        expect(instance.value).toStrictEqual(getDatabaseValue(testId))
      })
    })
  })

  describe('syncing list', () => {
    describe('syncing', () => {
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

        const { syncList } = useTestResourceAPI()

        const list = syncList()

        // Verifica se inicializa adequadamente
        expect(list.value).toStrictEqual(indexDatabaseValues())

        updateDatabaseValue('2', { count: 10 })

        expect(list.value).toStrictEqual(indexDatabaseValues())
      })

      it('should also sync the provided ref', () => {
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

        const { syncList } = useTestResourceAPI()

        const listRef = ref<TestResource[]>([])

        syncList([], listRef)

        // Verifica se inicializa adequadamente
        expect(listRef.value).toStrictEqual(indexDatabaseValues())

        updateDatabaseValue('2', { count: 10 })

        expect(listRef.value).toStrictEqual(indexDatabaseValues())
      })

      it('should filter list to match query and keep filter synced', () => {
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

        const { syncList } = useTestResourceAPI()

        const expectedResult = indexDatabaseValues().filter(
          ({ count }) => count === 5
        )

        const list = syncList([where('count', '==', 5)])

        expect(list.value).toStrictEqual(expectedResult)
        expect(list.value).not.toStrictEqual(indexDatabaseValues())
      })
    })

    describe('desyncing', () => {
      it('should throw when reading desynced list', () => {
        const { indexDatabaseValues, hasListListener } = mockDatabase({
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

        const { syncList, desyncList } = useTestResourceAPI()

        const list = syncList()

        // Verifica se inicializa adequadamente
        expect(list.value).toStrictEqual(indexDatabaseValues())
        expect(hasListListener()).toBeTruthy()

        desyncList()

        expect(() => list.value).toThrow(desyncedReadErrorMessage)
        expect(hasListListener()).toBeFalsy()
      })

      it('should call desyncList for previous calls', () => {
        const { indexDatabaseValues, hasListListener } = mockDatabase({
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

        const { syncList } = useTestResourceAPI()

        const list = syncList()

        // Verifica se inicializa adequadamente
        expect(list.value).toStrictEqual(indexDatabaseValues())
        expect(hasListListener()).toBeTruthy()

        syncList()

        expect(() => list.value).toThrow(desyncedReadErrorMessage)
        expect(hasListListener()).toBeTruthy()
      })
    })
  })

  describe('deleting', () => {
    it('should erase the resource', () => {
      const id = '1'

      const { getDatabaseValue, indexDatabaseValues } = mockDatabase({
        [id]: {
          name: 'scooby',
          count: 1,
          createdAt: new Date().toJSON(),
          modifiedAt: new Date().toJSON(),
        },
      })

      const { deleteForever } = useTestResourceAPI()

      deleteForever(id)

      expect(getDatabaseValue(id)).not.toBeDefined()
      expect(indexDatabaseValues()).toHaveLength(0)
    })
  })

  it('should get the correct doc when getDoc is called', () => {
    const { getDoc, resourceCollection } = useTestResourceAPI()

    const id = 'scooby'

    expect(getDoc(id)).toStrictEqual(mockDoc(resourceCollection, id))
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

    const { sync, syncList } = useTestResourceAPI()

    const instance = sync(instanceUid)
    const list = syncList()

    const oldInstance = instance.value
    const oldList = list.value

    expect(instance.value).toStrictEqual(getDatabaseValue(instanceUid))
    expect(instance.value).toStrictEqual(oldInstance)
    expect(list.value).toStrictEqual(indexDatabaseValues())
    expect(list.value).toStrictEqual(oldList)

    unmount()

    updateDatabaseValue(instanceUid, { count: 50 })

    expect(() => instance.value).toThrow(desyncedReadErrorMessage)
    expect(() => list.value).toThrow(desyncedReadErrorMessage)
  })
})
