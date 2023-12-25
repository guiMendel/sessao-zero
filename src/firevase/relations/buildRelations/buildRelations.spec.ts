import { mockFantasyDatabase } from '@/tests/mock/backend'

import { FirevaseClient } from '@/firevase'
import * as SyncableRefNamespace from '@/firevase/Syncable/SyncableRef'
import {
  fantasyVase,
  mockKing,
  mockKnight,
  mockLand,
} from '@/tests/mock/fantasyVase'
import { CleanupManager } from '@/utils/classes'
import { buildRelations } from '.'

describe('buildRelations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('raises if there are no relation settings', () => {
    const client = {
      relationSettings: undefined,
    } as FirevaseClient

    const callback = () =>
      buildRelations({
        cleanupManager: new CleanupManager(),
        client,
        previousValues: {},
        source: {},
      })

    expect(callback).toThrow('client has no relation settings')
  })

  describe('extracting relations', () => {
    it('should set the dont dispose flag', () => {
      mockFantasyDatabase({})

      const source = mockKnight()

      buildRelations({
        cleanupManager: new CleanupManager(),
        client: fantasyVase,
        previousValues: { [source.id]: source },
        source,
      })

      expect(source).toHaveProperty('dontDispose', true)
    })

    it('should raise if the previous value lacks a relation from the relation settings', () => {
      mockFantasyDatabase({})

      const source = mockKnight()

      // @ts-ignore
      delete source.king

      const callback = () =>
        buildRelations({
          cleanupManager: new CleanupManager(),
          client: fantasyVase,
          previousValues: { [source.id]: source },
          source,
        })

      expect(callback).toThrow('Falha ao extrair a relacao')
    })

    it('should extract the relation values from a previous resource', () => {
      mockFantasyDatabase({})

      const source = mockKnight('half-resource')

      const previous = mockKnight('resource', source)

      const relations = buildRelations({
        cleanupManager: new CleanupManager(),
        client: fantasyVase,
        previousValues: { [previous.id]: previous },
        source,
      })

      expect(relations).toStrictEqual({
        king: previous.king,
        missions: previous.missions,
        supervisedLands: previous.supervisedLands,
      })
    })
  })

  describe('creating relations', () => {
    describe('has-one', () => {
      it('should properly create has-one relation', async () => {
        const kingId = '1'
        const knightId = '2'

        const { getDatabaseValue } = mockFantasyDatabase({
          knights: { [knightId]: mockKnight('uploadable', { kingId }) },

          kings: { [kingId]: mockKing('uploadable') },
        })

        const source = (await getDatabaseValue('knights', knightId))!
        const king = await getDatabaseValue('kings', kingId)

        const relations = buildRelations({
          cleanupManager: new CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          source,
        })

        expect(relations.king.value).toStrictEqual(
          expect.objectContaining(king)
        )
      })

      it.todo('should return a has-one ref that updates properly', async () => {
        const kingId = '1'
        const knightId = '2'

        const { getDatabaseValue, updateDatabaseValue } = mockFantasyDatabase({
          knights: { [knightId]: mockKnight('uploadable', { kingId }) },

          kings: { [kingId]: mockKing('uploadable') },
        })

        const source = (await getDatabaseValue('knights', knightId))!
        const king = await getDatabaseValue('kings', kingId)

        const relations = buildRelations({
          cleanupManager: new CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          source,
        })

        expect(relations.king.value).toStrictEqual(
          expect.objectContaining(king)
        )

        await updateDatabaseValue('kings', kingId, { age: 9999 })

        expect(relations.king.value).toStrictEqual(
          expect.objectContaining(king)
        )
      })

      it('should correctly pass the cleanup manager to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            getCleanupManager: () => new CleanupManager(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const cleanupManager = new CleanupManager()

        buildRelations({
          cleanupManager,
          client: fantasyVase,
          previousValues: {},
          source: mockKnight('half-resource'),
        })

        expect(mockSyncableRef).toHaveBeenCalledTimes(3)
        expect(mockSyncableRef).toHaveBeenCalledWith(
          fantasyVase,
          'kings',
          expect.anything(),
          cleanupManager
        )
      })
    })

    describe('has-many', () => {
      it('should properly create relation', async () => {
        const kingId = '1'
        const knightIdA = '2'
        const knightIdB = '3'

        const { getDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
          knights: {
            [knightIdA]: mockKnight('uploadable', { kingId }),
            [knightIdB]: mockKnight('uploadable', { kingId }),
            [4]: mockKnight('uploadable', {
              kingId: (parseInt(kingId) + 1).toString(),
            }),
          },

          kings: { [kingId]: mockKing('uploadable') },
        })

        const source = (await getDatabaseValue('kings', kingId))!
        const allKnights = await indexDatabaseValues('knights')
        const knights = allKnights.filter(
          ({ kingId: currentKingId }) => currentKingId === kingId
        )

        const relations = buildRelations({
          cleanupManager: new CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          source,
        })

        expect(relations.knights.value).not.toStrictEqual(
          allKnights.map((knight) => expect.objectContaining(knight))
        )

        expect(relations.knights.value).toStrictEqual(
          knights.map((knight) => expect.objectContaining(knight))
        )
      })

      it.todo(
        'should return a has-many ref that updates properly',
        async () => {
          const kingId = '1'
          const knightId = '2'

          const { getDatabaseValue, updateDatabaseValue } = mockFantasyDatabase(
            {
              knights: { [knightId]: mockKnight('uploadable', { kingId }) },

              kings: { [kingId]: mockKing('uploadable') },
            }
          )

          const source = (await getDatabaseValue('knights', knightId))!
          const king = await getDatabaseValue('kings', kingId)

          const relations = buildRelations({
            cleanupManager: new CleanupManager(),
            client: fantasyVase,
            previousValues: {},
            source,
          })

          expect(relations.king.value).toStrictEqual(
            expect.objectContaining(king)
          )

          await updateDatabaseValue('kings', kingId, { age: 9999 })

          expect(relations.king.value).toStrictEqual(
            expect.objectContaining(king)
          )
        }
      )

      it('should correctly pass the cleanup manager to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            getCleanupManager: () => new CleanupManager(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const cleanupManager = new CleanupManager()

        buildRelations({
          cleanupManager,
          client: fantasyVase,
          previousValues: {},
          source: mockKing('half-resource'),
        })

        expect(mockSyncableRef).toHaveBeenCalledTimes(2)
        expect(mockSyncableRef).toHaveBeenCalledWith(
          fantasyVase,
          'knights',
          expect.anything(),
          cleanupManager
        )
      })
    })

    describe('many-to-many', () => {
      it('should properly create relation', async () => {
        const landId = '1'
        const knightIdA = '2'
        const knightIdB = '3'
        const nonMemberKnightId = '4'

        const { getDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
          knights: {
            [knightIdA]: mockKnight('uploadable'),
            [knightIdB]: mockKnight('uploadable'),
            [nonMemberKnightId]: mockKnight('uploadable'),
          },

          lands: { [landId]: mockLand('uploadable') },

          knightsLands: {
            [5]: { knights: knightIdA, lands: landId },
            [6]: { knights: knightIdB, lands: landId },
          },
        })

        const source = (await getDatabaseValue('lands', landId))!
        const allKnights = await indexDatabaseValues('knights')
        const knights = allKnights.filter(({ id }) => id !== nonMemberKnightId)

        const relations = buildRelations({
          cleanupManager: new CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          source,
        })

        expect(relations.supervisors.value).not.toStrictEqual(
          allKnights.map((knight) => expect.objectContaining(knight))
        )

        expect(relations.supervisors.value).toStrictEqual(
          knights.map((knight) => expect.objectContaining(knight))
        )
      })

      it.todo(
        'should return many-tomnay refs that update correctly',
        async () => {
          const landId = '1'
          const knightIdA = '2'
          const knightIdB = '3'
          const nonMemberKnightId = '4'

          const relationToRemoveId = '5'

          const {
            getDatabaseValue,
            indexDatabaseValues,
            updateDatabaseValue,
            deleteDatabaseValue,
          } = mockFantasyDatabase({
            knights: {
              [knightIdA]: mockKnight('uploadable'),
              [knightIdB]: mockKnight('uploadable'),
              [nonMemberKnightId]: mockKnight('uploadable'),
            },

            lands: { [landId]: mockLand('uploadable') },

            knightsLands: {
              [relationToRemoveId]: { knights: knightIdA, lands: landId },
              [6]: { knights: knightIdB, lands: landId },
            },
          })

          const source = (await getDatabaseValue('lands', landId))!
          const allKnights = await indexDatabaseValues('knights')
          const knights = allKnights.filter(
            ({ id }) => id !== nonMemberKnightId
          )

          const relations = buildRelations({
            cleanupManager: new CleanupManager(),
            client: fantasyVase,
            previousValues: {},
            source,
          })

          expect(relations.supervisors.value).toStrictEqual(
            knights.map((knight) => expect.objectContaining(knight))
          )

          const newGold = 5000
          await updateDatabaseValue('knights', knightIdA, { gold: newGold })

          expect(relations.supervisors.value).toStrictEqual(
            knights.map((knight) => {
              if (knight.id === knightIdA) knight.gold = newGold

              return expect.objectContaining(knight)
            })
          )

          await deleteDatabaseValue('knightsLands', relationToRemoveId)

          expect(relations.supervisors.value).toStrictEqual(
            knights
              .filter((knight) => knight.id !== knightIdA)
              .map((knight) => expect.objectContaining(knight))
          )
        }
      )

      it('should correctly pass the cleanup manager to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            getCleanupManager: () => new CleanupManager(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const cleanupManager = new CleanupManager()

        buildRelations({
          cleanupManager,
          client: fantasyVase,
          previousValues: {},
          source: mockLand('half-resource'),
        })

        expect(mockSyncableRef).toHaveBeenCalledTimes(2)
        expect(mockSyncableRef).toHaveBeenCalledWith(
          fantasyVase,
          'knights',
          'empty-query',
          cleanupManager
        )
      })

      it.todo('should link the passed cleanup manager')
    })
  })
})
