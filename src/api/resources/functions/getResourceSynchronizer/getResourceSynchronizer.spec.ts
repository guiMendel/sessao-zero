import { getMockDatabase } from '@/tests/mock/firebase'

import { mockPlayer } from '@/tests'
import { getResourceSynchronizer } from '.'
import { CleanupManager } from '@/utils/classes'
import { makeFullInstance, makeResource } from '..'
import { Mock } from 'vitest'
import { DocumentReference, Query, where } from 'firebase/firestore'
import { syncableRef } from '@/api/classes'

vi.mock('../makeFullInstance')

const mockMakeFullInstance = makeFullInstance as Mock

describe('getResourceSynchronizer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockMakeFullInstance.mockImplementation(makeResource)
  })

  describe('sync', () => {
    it('should sync current call', () => {
      const id = '1'

      const { getDatabaseValue, updateDatabaseValue } = getMockDatabase({
        [id]: mockPlayer({}, 'uploadable'),
      })

      const { sync } = getResourceSynchronizer('players', new CleanupManager())

      const instance = sync(id)

      // Ensures it initializes properly
      expect(instance.value).toStrictEqual(getDatabaseValue(id))

      updateDatabaseValue(id, { count: 10 })

      // Ensures it synced properly
      expect(instance.value).toStrictEqual(getDatabaseValue(id))
    })

    it('should also sync the provided ref', () => {
      const id = '1'

      const { getDatabaseValue, updateDatabaseValue } = getMockDatabase({
        [id]: mockPlayer({}, 'uploadable'),
      })

      const { sync } = getResourceSynchronizer('players', new CleanupManager())

      const instanceRef = syncableRef<'players', DocumentReference>(
        'players',
        'empty-document',
        new CleanupManager()
      )

      sync(id, instanceRef)

      // Ensures it initializes properly
      expect(instanceRef.value).toStrictEqual(getDatabaseValue(id))

      updateDatabaseValue(id, { count: 10 })

      // Ensures it synced properly
      expect(instanceRef.value).toStrictEqual(getDatabaseValue(id))
    })
  })

  describe('syncing list', () => {
    describe('syncing', () => {
      it('should sync to database content', () => {
        const { indexDatabaseValues, updateDatabaseValue } = getMockDatabase({
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
        })

        const { syncList } = getResourceSynchronizer(
          'players',
          new CleanupManager()
        )

        const list = syncList()

        // Verifica se inicializa adequadamente
        expect(list.value).toStrictEqual(indexDatabaseValues())

        updateDatabaseValue('2', { count: 10 })

        expect(list.value).toStrictEqual(indexDatabaseValues())
      })

      it('should also sync the provided ref', () => {
        const { indexDatabaseValues, updateDatabaseValue } = getMockDatabase({
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
        })

        const { syncList } = getResourceSynchronizer(
          'players',
          new CleanupManager()
        )

        const listRef = syncableRef<'players', Query>(
          'players',
          'empty-query',
          new CleanupManager()
        )

        expect(listRef.value).toStrictEqual([])

        syncList([], listRef)

        // Verifica se inicializa adequadamente
        expect(listRef.value).toStrictEqual(indexDatabaseValues())

        updateDatabaseValue('2', { count: 10 })

        expect(listRef.value).toStrictEqual(indexDatabaseValues())
      })

      it('should filter list to match query and keep filter synced', () => {
        const { indexDatabaseValues } = getMockDatabase({
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
        })

        const { syncList } = getResourceSynchronizer(
          'players',
          new CleanupManager()
        )

        const expectedResult = indexDatabaseValues().filter(
          ({ nickname }) => nickname === 'stevens'
        )

        const list = syncList([where('nickname', '==', 'stevens')])

        expect(list.value).toStrictEqual(expectedResult)
        expect(list.value).not.toStrictEqual(indexDatabaseValues())
      })
    })
  })

  it.todo('should link the cleanup manager to the syncable refs')
})
