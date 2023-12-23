import { getMockDatabase } from '@/tests/mock/firebase'

import * as SyncableRefNamespace from '@/firevase/Syncable/SyncableRef'
import { mockPlayer } from '@/tests'
import { CleanupManager } from '@/utils/classes'
import {
  DocumentReference,
  Query,
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { Mock } from 'vitest'
import { getResourceSynchronizer } from '.'
import { makeResource } from '../makeResource'
import { makeResource } from '../makeHalfResource'
import { db } from '@/api/firebase'

vi.mock('../makeFullInstance')

const mockMakeFullInstance = makeResource as Mock

describe('getResourceSynchronizer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockMakeFullInstance.mockImplementation(makeResource)
  })

  describe('sync', () => {
    it('should sync current call', async () => {
      const id = '1'

      const { getDatabaseValue, updateDatabaseValue } = getMockDatabase({
        players: {
          [id]: mockPlayer({}, 'uploadable'),
        },
      })

      const { sync } = getResourceSynchronizer('players', new CleanupManager())

      const instance = sync(id)

      // Ensures it initializes properly
      expect(instance.value).toStrictEqual(
        await getDatabaseValue('players', id)
      )

      await updateDatabaseValue('players', id, { about: 'jooj' })

      // Ensures it synced properly
      expect(instance.value).toStrictEqual(
        await getDatabaseValue('players', id)
      )
    })

    it('should also sync the provided ref', async () => {
      const id = '1'

      const { getDatabaseValue, updateDatabaseValue } = getMockDatabase({
        players: {
          [id]: mockPlayer({}, 'uploadable'),
        },
      })

      const { sync } = getResourceSynchronizer('players', new CleanupManager())

      const instanceRef = SyncableRefNamespace.syncableRef<
        'players',
        DocumentReference
      >('players', 'empty-document', new CleanupManager())

      sync(id, instanceRef)

      // Ensures it initializes properly
      expect(instanceRef.value).toStrictEqual(
        await getDatabaseValue('players', id)
      )

      await updateDatabaseValue('players', id, { about: 'jooj' })

      // Ensures it synced properly
      expect(instanceRef.value).toStrictEqual(
        await getDatabaseValue('players', id)
      )
    })

    it('passes the correct params to syncableRef', async () => {
      const mockSyncableRef = vi.fn()

      vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
        mockSyncableRef
      )

      const id = '1'

      getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const cleanupManager = new CleanupManager()

      const { sync } = getResourceSynchronizer('players', cleanupManager)

      sync(id)

      expect(mockSyncableRef).toHaveBeenCalledWith(
        'players',
        doc(collection(db, 'players'), id),
        cleanupManager
      )
    })
  })

  describe('syncing list', () => {
    it('should sync to database content', async () => {
      const { indexDatabaseValues, updateDatabaseValue } = getMockDatabase({
        players: {
          '1': mockPlayer(
            {
              name: 'scooby',
              nickname: 'snacks',
            },
            'uploadable'
          ),
          '2': mockPlayer(
            {
              name: 'bobby',
              nickname: 'stevens',
            },
            'uploadable'
          ),
        },
      })

      const { syncList } = getResourceSynchronizer(
        'players',
        new CleanupManager()
      )

      const list = syncList()

      // Verifica se inicializa adequadamente
      expect(list.value).toStrictEqual(await indexDatabaseValues('players'))

      await updateDatabaseValue('players', '2', { about: 'meem' })

      expect(list.value).toStrictEqual(await indexDatabaseValues('players'))
    })

    it('should also sync the provided ref', async () => {
      const { indexDatabaseValues, updateDatabaseValue } = getMockDatabase({
        players: {
          '1': mockPlayer(
            {
              name: 'scooby',
              nickname: 'snacks',
            },
            'uploadable'
          ),
          '2': mockPlayer(
            {
              name: 'bobby',
              nickname: 'stevens',
            },
            'uploadable'
          ),
        },
      })

      const { syncList } = getResourceSynchronizer(
        'players',
        new CleanupManager()
      )

      const listRef = SyncableRefNamespace.syncableRef<'players', Query>(
        'players',
        'empty-query',
        new CleanupManager()
      )

      expect(listRef.value).toStrictEqual([])

      syncList([], listRef)

      // Verifica se inicializa adequadamente
      expect(listRef.value).toStrictEqual(await indexDatabaseValues('players'))

      await updateDatabaseValue('players', '2', { about: 'meem' })

      expect(listRef.value).toStrictEqual(await indexDatabaseValues('players'))
    })

    it('should filter list to match query and keep filter synced', async () => {
      const { indexDatabaseValues } = getMockDatabase({
        players: {
          '1': mockPlayer(
            {
              name: 'scooby',
              nickname: 'snacks',
            },
            'uploadable'
          ),
          '2': mockPlayer(
            {
              name: 'bobby',
              nickname: 'stevens',
            },
            'uploadable'
          ),
        },
      })

      const { syncList } = getResourceSynchronizer(
        'players',
        new CleanupManager()
      )

      const expectedResult = (await indexDatabaseValues('players')).filter(
        ({ nickname }) => nickname === 'stevens'
      )

      const list = syncList([where('nickname', '==', 'stevens')])

      expect(list.value).toStrictEqual(expectedResult)
      expect(list.value).not.toStrictEqual(await indexDatabaseValues('players'))
    })

    it('passes the correct params to make full instance', async () => {
      const mockSyncableRef = vi.fn()

      vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
        mockSyncableRef
      )

      const id = '1'

      getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const cleanupManager = new CleanupManager()

      const { syncList } = getResourceSynchronizer('players', cleanupManager)

      syncList()

      expect(mockSyncableRef).toHaveBeenCalledWith(
        'players',
        expect.objectContaining(
          JSON.parse(JSON.stringify(query(collection(db, 'players'))))
        ),
        cleanupManager
      )
    })
  })
})
