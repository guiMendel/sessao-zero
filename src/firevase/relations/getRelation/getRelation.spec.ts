import { mockFantasyDatabase } from '@/tests/mock/backend'

import {
  fantasyVase,
  mockKing,
  mockKnight,
  mockLand,
} from '@/tests/mock/fantasyVase'
import { CleanupManager } from '@/utils/classes'
import { getRelation } from '.'
import * as GetResourceGetterNamespace from '../../resources/functions/getResourceGetter'

describe('getRelation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('has-one relation', () => {
    it('gets adequately', async () => {
      const id = '1'
      const kingId = '2'

      const { getDatabaseValue } = mockFantasyDatabase({
        kings: { [kingId]: mockKing('uploadable') },
        knights: { [id]: mockKnight('uploadable', { kingId }) },
      })

      const knight = await getDatabaseValue('knights', id)
      const king = await getDatabaseValue('kings', kingId)

      if (knight == undefined || king == undefined)
        throw new Error('error in database')

      await expect(
        getRelation(fantasyVase, knight, 'king')
      ).resolves.toStrictEqual(king)
    })

    it('passes the cleanup manager ahead', async () => {
      const mockGetResourceGetter = vi.fn().mockReturnValue({ get: vi.fn() })

      vi.spyOn(
        GetResourceGetterNamespace,
        'getResourceGetter'
      ).mockImplementation(mockGetResourceGetter)

      const id = '1'
      const kingId = '2'

      const { getDatabaseValue } = mockFantasyDatabase({
        kings: { [kingId]: mockKing('uploadable') },
        knights: { [id]: mockKnight('uploadable', { kingId }) },
      })

      const knight = await getDatabaseValue('knights', id)

      if (knight == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(fantasyVase, knight, 'king', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        fantasyVase,
        'kings',
        cleanupManager
      )
    })
  })

  describe('has-many relation', () => {
    it('gets adequately', async () => {
      const id = '1'

      const { getDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
        kings: { [id]: mockKing('uploadable') },
        knights: {
          [2]: mockKnight('uploadable', { kingId: id }),
          [3]: mockKnight('uploadable', { kingId: id }),
          [4]: mockKnight('uploadable', {
            kingId: (parseInt(id) + 1).toString(),
          }),
        },
      })

      const king = await getDatabaseValue('kings', id)
      const knights = (await indexDatabaseValues('knights')).filter(
        (knight) => knight.kingId === id
      )

      if (knights.length == 0 || king == undefined)
        throw new Error('error in database')

      await expect(
        getRelation(fantasyVase, king, 'knights')
      ).resolves.toStrictEqual(knights)
    })

    it('passes the cleanup manager ahead', async () => {
      const mockGetResourceGetter = vi
        .fn()
        .mockReturnValue({ getList: vi.fn() })

      vi.spyOn(
        GetResourceGetterNamespace,
        'getResourceGetter'
      ).mockImplementation(mockGetResourceGetter)

      const id = '1'

      const { getDatabaseValue } = mockFantasyDatabase({
        kings: { [id]: mockKing('uploadable') },
      })

      const king = await getDatabaseValue('kings', id)

      if (king == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(fantasyVase, king, 'knights', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        fantasyVase,
        'knights',
        cleanupManager
      )
    })
  })

  describe('many-to-many relation', () => {
    it('gets adequately', async () => {
      const id1 = '1'
      const id2 = '2'
      const linkedId1 = '3'
      const linkedId2 = '4'
      const linkedId3 = '5'

      const { getDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
        lands: {
          [id1]: mockLand('uploadable'),
          [id2]: mockLand('uploadable'),
        },
        knights: {
          [linkedId1]: mockKnight('uploadable'),
          [linkedId2]: mockKnight('uploadable'),
          [linkedId3]: mockKnight('uploadable'),
        },
        knightsLands: {
          [6]: { knights: linkedId1, lands: id1 },
          [7]: { knights: linkedId2, lands: id1 },
          [8]: { knights: linkedId2, lands: id2 },
          [9]: { knights: linkedId3, lands: id2 },
        },
      })

      // For lands
      {
        const land1 = await getDatabaseValue('lands', id1)
        const land2 = await getDatabaseValue('lands', id2)

        const knightsBridge1 = (
          await indexDatabaseValues('knightsLands')
        ).filter(({ lands }) => lands === id1)
        const knightsBridge2 = (
          await indexDatabaseValues('knightsLands')
        ).filter(({ lands }) => lands === id2)

        const knights1 = (await indexDatabaseValues('knights')).filter(
          (knight) =>
            knightsBridge1.some((bridge) => bridge.knights === knight.id)
        )
        const knights2 = (await indexDatabaseValues('knights')).filter(
          (knight) =>
            knightsBridge2.some((bridge) => bridge.knights === knight.id)
        )

        if (land1 == undefined || land2 == undefined)
          throw new Error('error in database')

        await expect(
          getRelation(fantasyVase, land1, 'supervisors')
        ).resolves.toStrictEqual(knights1)

        await expect(
          getRelation(fantasyVase, land2, 'supervisors')
        ).resolves.toStrictEqual(knights2)
      }

      // For knights
      {
        const knight1 = await getDatabaseValue('knights', linkedId1)
        const knight2 = await getDatabaseValue('knights', linkedId2)
        const knight3 = await getDatabaseValue('knights', linkedId3)

        const landsBridge1 = (await indexDatabaseValues('knightsLands')).filter(
          ({ knights }) => knights === linkedId1
        )
        const landsBridge2 = (await indexDatabaseValues('knightsLands')).filter(
          ({ knights }) => knights === linkedId2
        )
        const landsBridge3 = (await indexDatabaseValues('knightsLands')).filter(
          ({ knights }) => knights === linkedId3
        )

        const lands1 = (await indexDatabaseValues('lands')).filter((land) =>
          landsBridge1.some((bridge) => bridge.lands === land.id)
        )
        const lands2 = (await indexDatabaseValues('lands')).filter((land) =>
          landsBridge2.some((bridge) => bridge.lands === land.id)
        )
        const lands3 = (await indexDatabaseValues('lands')).filter((land) =>
          landsBridge3.some((bridge) => bridge.lands === land.id)
        )

        if (
          knight1 == undefined ||
          knight2 == undefined ||
          knight3 == undefined
        )
          throw new Error('error in database')

        await expect(
          getRelation(fantasyVase, knight1, 'supervisedLands')
        ).resolves.toStrictEqual(lands1)

        await expect(
          getRelation(fantasyVase, knight2, 'supervisedLands')
        ).resolves.toStrictEqual(lands2)

        await expect(
          getRelation(fantasyVase, knight3, 'supervisedLands')
        ).resolves.toStrictEqual(lands3)
      }
    })

    it('passes the cleanup manager ahead', async () => {
      const mockGetResourceGetter = vi
        .fn()
        .mockReturnValue({ getList: vi.fn() })

      vi.spyOn(
        GetResourceGetterNamespace,
        'getResourceGetter'
      ).mockImplementation(mockGetResourceGetter)

      const id = '1'

      const { getDatabaseValue } = mockFantasyDatabase({
        lands: { [id]: mockLand('uploadable') },
      })

      const land = await getDatabaseValue('lands', id)

      if (land == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(fantasyVase, land, 'supervisors', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        fantasyVase,
        'knights',
        cleanupManager
      )
    })
  })
})
