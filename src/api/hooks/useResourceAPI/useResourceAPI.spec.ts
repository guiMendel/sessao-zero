import { Resource, Uploadable } from '@/types'
import { collection, doc, onSnapshot, query } from 'firebase/firestore'
import { Mock } from 'vitest'
import { useResourceAPI } from '.'

vi.mock('@/api', () => ({ db: 'mockDb' }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
}))

const mockDoc = doc as Mock
const mockOnSnapshot = onSnapshot as Mock
const mockCollection = collection as Mock
const mockQuery = query as Mock

interface TestResource extends Resource {
  name: string
  count: number
}

type Snapshot = { data: () => any; id: string }
type OnSnapshotListener = (snapshot: Snapshot) => void

const parseTestSnapshot = (uid: string, data: any) => ({
  count: data.count,
  name: data.name,
  uid,
  createdAt: new Date(data.createdAt),
  modifiedAt: new Date(data.modifiedAt),
})

const useTestResourceAPI = () =>
  useResourceAPI<TestResource>('test-resource', parseTestSnapshot)

describe('useResourceAPI', () => {
  beforeEach(() => {
    vitest.restoreAllMocks()

    mockDoc.mockImplementation((collection, uid) => ({ collection, uid }))
    mockOnSnapshot.mockReturnValue({})
    mockCollection.mockImplementation((db, name) => ({ name, db }))
    mockQuery.mockReturnValue(vitest.fn())
  })

  describe('syncResource', () => {
    it('should return the same ref that was provided as second argument', () => {})

    it('should keep it synced when new snapshots are emitted', () => {
      const testUid = 'uid1'

      const testValue: Uploadable<TestResource> = {
        name: 'scooby',
        count: 1,
        createdAt: new Date().toJSON(),
        modifiedAt: new Date().toJSON(),
      }

      const mockSnapshotDatabase: Record<string, Snapshot> = {
        [testUid]: {
          data: () => testValue,
          id: testUid,
        },
      }
      const listeners: Record<string, OnSnapshotListener> = {}

      // Simplifica os docs
      mockDoc.mockImplementation((_, uid) => uid)

      // Sobrescreve snapshots
      mockOnSnapshot.mockImplementation(
        (uid: string, listener: OnSnapshotListener) => {
          // Adiciona o listener
          listeners[uid] = listener

          // Ja inicializa ele
          listener(mockSnapshotDatabase[uid])

          return vi.fn()
        }
      )

      const { syncResource } = useTestResourceAPI()

      const instance = syncResource(testUid)

      // Ensures it initializes properly
      expect(instance.value).toStrictEqual(
        parseTestSnapshot(testUid, mockSnapshotDatabase[testUid].data())
      )

      testValue.name = 'doo'

      // Update all listeners
      for (const [uid, listener] of Object.entries(listeners))
        listener(mockSnapshotDatabase[uid])

      // Ensures it synced properly
      expect(instance.value).toStrictEqual(
        parseTestSnapshot(testUid, mockSnapshotDatabase[testUid].data())
      )
    })

    it('should unsubscribe a previous call and sync to the new call', () => {})
  })

  describe('syncListResources', () => {
    it('should keep list synced when new snapshots are emitted', () => {})

    it('should unsibscribe a previous call', () => {})

    it('should update list to match new query when listQueryBuilder is updated', () => {})
  })

  it('should no longer update a ref when desyncResource is called')

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
})
