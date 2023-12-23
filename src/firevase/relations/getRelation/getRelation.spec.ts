import { getMockDatabase } from '@/tests/mock/firebase'

import { mockGuild, mockPlayer } from '@/tests'
import { CleanupManager } from '@/utils/classes'
import { getRelation } from '.'
import * as GetResourceGetterNamespace from '../../resources/functions/getResourceGetter'

describe('getRelation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('has-one relation', () => {
    it('gets adequately', async () => {
      const id = '1'
      const ownerUid = '2'

      const { getDatabaseValue } = getMockDatabase({
        players: { [ownerUid]: mockPlayer({}, 'uploadable') },
        guilds: { [id]: mockGuild({ ownerUid }, 'uploadable') },
      })

      const guild = await getDatabaseValue('guilds', id)
      const owner = await getDatabaseValue('players', ownerUid)

      if (guild == undefined || owner == undefined)
        throw new Error('error in database')

      await expect(getRelation(guild, 'owner')).resolves.toStrictEqual(owner)
    })

    it('passes the cleanup manager ahead', async () => {
      const mockGetResourceGetter = vi.fn().mockReturnValue({ get: vi.fn() })

      vi.spyOn(
        GetResourceGetterNamespace,
        'getResourceGetter'
      ).mockImplementation(mockGetResourceGetter)

      const id = '1'
      const ownerUid = '2'

      const { getDatabaseValue } = getMockDatabase({
        players: { [ownerUid]: mockPlayer({}, 'uploadable') },
        guilds: { [id]: mockGuild({ ownerUid }, 'uploadable') },
      })

      const guild = await getDatabaseValue('guilds', id)

      if (guild == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(guild, 'owner', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        'players',
        cleanupManager
      )
    })
  })

  describe('has-many relation', () => {
    it('gets adequately', async () => {
      const id = '1'

      const { getDatabaseValue, indexDatabaseValues } = getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
        guilds: {
          [2]: mockGuild({ ownerUid: id }, 'uploadable'),
          [3]: mockGuild({ ownerUid: id }, 'uploadable'),
          [4]: mockGuild(
            { ownerUid: (parseInt(id) + 1).toString() },
            'uploadable'
          ),
        },
      })

      const owner = await getDatabaseValue('players', id)
      const ownedGuilds = (await indexDatabaseValues('guilds')).filter(
        (guild) => guild.ownerUid === id
      )

      if (ownedGuilds.length == 0 || owner == undefined)
        throw new Error('error in database')

      await expect(getRelation(owner, 'ownedGuilds')).resolves.toStrictEqual(
        ownedGuilds
      )
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

      const { getDatabaseValue } = getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const owner = await getDatabaseValue('players', id)

      if (owner == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(owner, 'ownedGuilds', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        'guilds',
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

      const { getDatabaseValue, indexDatabaseValues } = getMockDatabase({
        players: {
          [id1]: mockPlayer({}, 'uploadable'),
          [id2]: mockPlayer({}, 'uploadable'),
        },
        guilds: {
          [linkedId1]: mockGuild({}, 'uploadable'),
          [linkedId2]: mockGuild({}, 'uploadable'),
          [linkedId3]: mockGuild({}, 'uploadable'),
        },
        playersGuilds: {
          [6]: { guilds: linkedId1, players: id1 },
          [7]: { guilds: linkedId2, players: id1 },
          [8]: { guilds: linkedId2, players: id2 },
          [9]: { guilds: linkedId3, players: id2 },
        },
      })

      // For players
      {
        const player1 = await getDatabaseValue('players', id1)
        const player2 = await getDatabaseValue('players', id2)

        const guildsBridge1 = (
          await indexDatabaseValues('playersGuilds')
        ).filter(({ players }) => players === id1)
        const guildsBridge2 = (
          await indexDatabaseValues('playersGuilds')
        ).filter(({ players }) => players === id2)

        const guilds1 = (await indexDatabaseValues('guilds')).filter((guild) =>
          guildsBridge1.some((bridge) => bridge.guilds === guild.id)
        )
        const guilds2 = (await indexDatabaseValues('guilds')).filter((guild) =>
          guildsBridge2.some((bridge) => bridge.guilds === guild.id)
        )

        if (player1 == undefined || player2 == undefined)
          throw new Error('error in database')

        await expect(getRelation(player1, 'guilds')).resolves.toStrictEqual(
          guilds1
        )

        await expect(getRelation(player2, 'guilds')).resolves.toStrictEqual(
          guilds2
        )
      }

      // For guilds
      {
        const guild1 = await getDatabaseValue('guilds', linkedId1)
        const guild2 = await getDatabaseValue('guilds', linkedId2)
        const guild3 = await getDatabaseValue('guilds', linkedId3)

        const playersBridge1 = (
          await indexDatabaseValues('playersGuilds')
        ).filter(({ guilds }) => guilds === linkedId1)
        const playersBridge2 = (
          await indexDatabaseValues('playersGuilds')
        ).filter(({ guilds }) => guilds === linkedId2)
        const playersBridge3 = (
          await indexDatabaseValues('playersGuilds')
        ).filter(({ guilds }) => guilds === linkedId3)

        const players1 = (await indexDatabaseValues('players')).filter(
          (player) =>
            playersBridge1.some((bridge) => bridge.players === player.id)
        )
        const players2 = (await indexDatabaseValues('players')).filter(
          (player) =>
            playersBridge2.some((bridge) => bridge.players === player.id)
        )
        const players3 = (await indexDatabaseValues('players')).filter(
          (player) =>
            playersBridge3.some((bridge) => bridge.players === player.id)
        )

        if (guild1 == undefined || guild2 == undefined || guild3 == undefined)
          throw new Error('error in database')

        await expect(getRelation(guild1, 'players')).resolves.toStrictEqual(
          players1
        )

        await expect(getRelation(guild2, 'players')).resolves.toStrictEqual(
          players2
        )

        await expect(getRelation(guild3, 'players')).resolves.toStrictEqual(
          players3
        )
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

      const { getDatabaseValue } = getMockDatabase({
        players: { [id]: mockPlayer({}, 'uploadable') },
      })

      const player = await getDatabaseValue('players', id)

      if (player == undefined) throw new Error('error in database')

      const cleanupManager = new CleanupManager()

      await getRelation(player, 'guilds', cleanupManager)

      expect(mockGetResourceGetter).toHaveBeenCalledWith(
        'guilds',
        cleanupManager
      )
    })
  })
})
