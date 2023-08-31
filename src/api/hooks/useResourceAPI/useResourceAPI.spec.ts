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

const parseTestSnapshot = (id: string, data: any) => ({
  count: data.count,
  name: data.name,
  id,
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
  for (const id in values)
    mockSnapshotDatabase[id] = {
      data: () => values[id],
      id: id,
    }

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

  const getDatabaseValue = (id: string) =>
    parseTestSnapshot(id, mockSnapshotDatabase[id].data())

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
      modifiedAt: new Date().toJSON(),
    }

    // Update all listeners
    for (const [id, listener] of Object.entries(docListeners))
      listener(mockSnapshotDatabase[id])

    for (const { listener, query } of databaseListeners) {
      const queriedSnapshots = query(Object.values(mockSnapshotDatabase))

      // If the updated snapshot is inthis query, trigger it
      if (queriedSnapshots.some(({ id }) => id === id))
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

    mockDoc.mockImplementation((collection, id) => ({ collection, id }))
    mockOnSnapshot.mockReturnValue({})
    mockCollection.mockImplementation((db, name) => ({ name, db }))
    mockQuery.mockReturnValue(vitest.fn())
  })

  describe('creating', () => {
    it.todo('should not upload password or id')
    it.todo('should correctly add createdAt and modifiedAt properties')
    it.todo('should add the doc with the provided properties')
  })

  describe('updating', () => {
    it.todo('should not upload password or id')
    it.todo('should correctly update the modifiedAt property')
    it.todo('should update the doc with the provided properties')
  })

  describe('syncing single', () => {
    describe('syncing', () => {
      it.todo('should also sync the provided ref')

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
    })

    describe('desyncing', () => {
      it.todo('should call desync for previous calls')

      it('should no longer update a call after desync is called', () => {
        const testUid = '1'

        const { getDatabaseValue, updateDatabaseValue } = mockDatabase({
          [testUid]: {
            name: 'scooby',
            count: 1,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
          },
        })

        const { sync, desync } = useTestResourceAPI()

        const instance = sync(testUid)

        const oldValue = instance.value

        // Ensures it initializes properly
        expect(instance.value).toStrictEqual(getDatabaseValue(testUid))
        expect(instance.value).not.toHaveProperty('count', 10)
        expect(instance.value).toStrictEqual(oldValue)

        desync()

        updateDatabaseValue(testUid, { count: 10 })

        // Ensures it synced properly
        expect(instance.value).not.toHaveProperty('count', 10)
        expect(instance.value).toStrictEqual(oldValue)
      })
    })

    describe('writing', () => {
      it.todo('should ignore writes when desynced')
      it.todo('should desync and set null to the ref when writing null')
      it.todo('should call update with valid data')
    })
  })

  describe('syncing list', () => {
    describe('syncing', () => {
      it.todo('should use the provided ref and return it')

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

      it.todo(
        'should filter list to match query and keep filter synced',
        async () => {
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
        }
      )
    })

    describe('desyncing', () => {
      it.todo('should call desyncList for previous calls')

      it.todo(
        'should no longer update a call after desyncList is called',
        () => {}
      )
    })
  })

  describe('deleting', () => {
    it.todo('should erase the resource')
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

    expect(instance.value).not.toStrictEqual(getDatabaseValue(instanceUid))
    expect(instance.value).toStrictEqual(oldInstance)
    expect(list.value).not.toStrictEqual(indexDatabaseValues())
    expect(list.value).toStrictEqual(oldList)
  })
})
