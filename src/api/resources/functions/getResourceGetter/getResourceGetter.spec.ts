import { getMockDatabase } from '@/tests/mock/firebase'

import { mockPlayer } from '@/tests'
import { CleanupManager } from '@/utils/classes'
import { where } from 'firebase/firestore'
import { Mock } from 'vitest'
import { getResourceGetter } from '.'
import { makeFullInstance } from '../makeFullInstance'
import { makeResource } from '../makeResource'

vi.mock('../makeFullInstance')

const mockMakeFullInstance = makeFullInstance as Mock

describe('getResourceGetter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockMakeFullInstance.mockImplementation(makeResource)
  })

  describe('get', () => {
    it('should get the appropriate value', async () => {
      const id = '1'

      const { getDatabaseValue } = getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const { get } = getResourceGetter('players', new CleanupManager())

      await expect(get(id)).resolves.toStrictEqual(
        await getDatabaseValue('players', id)
      )
    })

    it('passes the correct params to make full instance', async () => {
      const id = '1'

      getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const cleanupManager = new CleanupManager()

      const { get } = getResourceGetter('players', cleanupManager)

      await get(id)

      expect(mockMakeFullInstance).toHaveBeenCalledWith(
        expect.objectContaining({ id }),
        'players',
        cleanupManager,
        []
      )
    })
  })

  describe('getList', () => {
    it('with no filters should get all the docs', async () => {
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

      const { getList } = getResourceGetter('players', new CleanupManager())

      await expect(getList()).resolves.toStrictEqual(
        await indexDatabaseValues('players')
      )
    })

    it('should appropriately filter the docs', async () => {
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

      const { getList } = getResourceGetter('players', new CleanupManager())

      const expectedResult = (await indexDatabaseValues('players')).filter(
        ({ nickname }) => nickname === 'stevens'
      )

      const list = await getList([where('nickname', '==', 'stevens')])

      expect(list).toStrictEqual(expectedResult)
      expect(list).not.toStrictEqual(await indexDatabaseValues('players'))
    })

    it('passes the correct params to make full instance', async () => {
      const id = '1'

      getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const cleanupManager = new CleanupManager()

      const { getList } = getResourceGetter('players', cleanupManager)

      await getList()

      expect(mockMakeFullInstance).toHaveBeenCalledWith(
        { docs: [expect.objectContaining({ id })] },
        'players',
        cleanupManager,
        []
      )
    })
  })
})
