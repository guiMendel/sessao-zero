import { getMockDatabase } from '@/tests/mock/firebase'

import { mockPlayer } from '@/tests'
import { getResourceGetter } from '.'
import { CleanupManager } from '@/utils/classes'
import { makeFullInstance, makeResource } from '..'
import { Mock } from 'vitest'
import { where } from 'firebase/firestore'

vi.mock('../makeFullInstance')

const mockMakeFullInstance = makeFullInstance as Mock

describe('getResourceGetter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockMakeFullInstance.mockImplementation(makeResource)
  })

  describe('get', () => {
    it('should get the appropriate value', () => {
      const id = '1'

      const { getDatabaseValue } = getMockDatabase({
        [id]: mockPlayer({}, 'uploadable'),
      })

      const { get } = getResourceGetter('players', new CleanupManager())

      expect(get(id)).resolves.toStrictEqual(getDatabaseValue(id))
    })
  })

  describe('getList', () => {
    it('with no filters should get all the docs', () => {
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

      const { getList } = getResourceGetter('players', new CleanupManager())

      expect(getList()).resolves.toStrictEqual(indexDatabaseValues())
    })

    it('should appropriately filter the docs', async () => {
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

      const { getList } = getResourceGetter('players', new CleanupManager())

      const expectedResult = indexDatabaseValues().filter(
        ({ nickname }) => nickname === 'stevens'
      )

      const list = await getList([where('nickname', '==', 'stevens')])

      expect(list).toStrictEqual(expectedResult)
      expect(list).not.toStrictEqual(indexDatabaseValues())
    })
  })

  it.todo('should link the cleanup manager')
})
