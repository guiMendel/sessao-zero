import { mockFantasyDatabase } from '@/tests/mock/backend'

import { FirevaseClient } from '@/firevase'
import * as SyncableRefNamespace from '@/firevase/Syncable'
import {
  FantasyVase,
  fantasyVase,
  mockKing,
  mockKnight,
  mockLand,
} from '@/tests/mock/fantasyVase'
import * as CleanupManagerNamespace from '@/utils/classes/CleanupManager'
import { buildRelations } from '.'
import { Resource } from '@/firevase/resources'
import { toValue } from 'vue'
import {
  CleanupManagerInterceptor,
  cleanupManagerInterceptor,
  interceptCleanupManagers,
} from '@/tests/helpers'

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
        cleanupManager: new CleanupManagerNamespace.CleanupManager(),
        client,
        previousValues: {},
        source: {},
        resourceLayersLimit: 1,
      })

    expect(callback).toThrow('client has no relation settings')
  })

  // TODO: testar que limpar o parent cleanup manager limpa os bridges e os refs gerados
  // TODO: testar que o dispose dos refs gerados limpa o sync do bridge tambem

  describe('extracting relations', () => {
    it('should set the dont dispose flag', () => {
      mockFantasyDatabase({})

      const source = mockKnight()

      buildRelations({
        cleanupManager: new CleanupManagerNamespace.CleanupManager(),
        client: fantasyVase,
        previousValues: { [source.id]: source },
        resourceLayersLimit: 1,
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
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: { [source.id]: source },
          resourceLayersLimit: 1,
          source,
        })

      expect(callback).toThrow('Falha ao extrair a relacao')
    })

    it('should extract the relation values from a previous resource', () => {
      mockFantasyDatabase({})

      const source = mockKnight('half-resource')

      const previous = mockKnight('resource', source)

      const relations = buildRelations({
        cleanupManager: new CleanupManagerNamespace.CleanupManager(),
        client: fantasyVase,
        previousValues: { [previous.id]: previous },
        resourceLayersLimit: 1,
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
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
          source,
        })

        expect(relations.king.value).toStrictEqual(king)
      })

      it('should return a has-one ref that updates properly', async () => {
        const landId = '1'
        const rulerIdA = '2'

        // No relation yet
        const {
          getDatabaseValue,
          updateDatabaseValue,
          addDatabaseValue,
          deleteDatabaseValue,
        } = mockFantasyDatabase({
          lands: { [landId]: mockLand('uploadable', { kingId: undefined }) },
        })

        const source = await getDatabaseValue('lands', landId)

        if (source == undefined) throw new Error('database error')

        const relations = buildRelations({
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
          source,
        })

        expect(relations.ruler.value).toStrictEqual(undefined)

        // Add a relation
        await updateDatabaseValue('lands', landId, { kingId: rulerIdA })

        expect(relations.ruler.value).toStrictEqual(undefined)

        await updateDatabaseValue('kings', rulerIdA, mockKing('uploadable'))

        const kingA = await getDatabaseValue('kings', rulerIdA)

        if (kingA == undefined) throw new Error('database error')

        expect(relations.ruler.value).toStrictEqual(kingA)

        // Update relation target's properties
        kingA.age = 9999

        expect(relations.ruler.value).not.toStrictEqual(kingA)

        await updateDatabaseValue('kings', rulerIdA, { age: kingA.age })

        expect(relations.ruler.value).toStrictEqual(kingA)

        // Change relation target
        const { id: rulerIdB } = await addDatabaseValue(
          'kings',
          mockKing('uploadable')
        )

        await updateDatabaseValue('lands', landId, { kingId: rulerIdB })

        const kingB = await getDatabaseValue('kings', rulerIdB)

        if (kingB == undefined) throw new Error('database error')

        expect(relations.ruler.value).toStrictEqual(kingB)

        // Delete relation target
        await deleteDatabaseValue('kings', rulerIdB)

        expect(relations.ruler.value).toBeUndefined()
      })

      it('should pass the correct params to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            getCleanupManager: () =>
              new CleanupManagerNamespace.CleanupManager(),
            onDispose: vi.fn(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const resourceLayersLimit = 1

        buildRelations({
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit,
          source: mockKnight('half-resource'),
        })

        expect(mockSyncableRef).toHaveBeenCalledTimes(3)
        expect(mockSyncableRef).toHaveBeenCalledWith(
          fantasyVase,
          'kings',
          expect.anything(),
          expect.anything(),
          resourceLayersLimit - 1
        )
      })

      it('should dispose bridge and ref syncs when parent cleanup manager disposes', () => {
        // Removes all relations but the has-one king of a knight for better control
        const vase = fantasyVase.configureRelations(({ hasOne }) => ({
          knights: {
            king: hasOne('kings', { relationKey: 'kingId' }, 'protected'),
          },
        }))

        // Store each cleanup manager construction
        const parentCleanupManager = cleanupManagerInterceptor()
        const bridgeCleanup = cleanupManagerInterceptor()
        const refCleanup = cleanupManagerInterceptor()

        vi.spyOn(CleanupManagerNamespace, 'CleanupManager').mockImplementation(
          interceptCleanupManagers(
            parentCleanupManager,
            bridgeCleanup,
            refCleanup
          )
        )

        // Create the parent
        new CleanupManagerNamespace.CleanupManager()

        if (parentCleanupManager.value == undefined)
          throw new Error('Failed to store cleanup managers')

        mockFantasyDatabase({})

        buildRelations({
          cleanupManager: parentCleanupManager.value!,
          client: vase,
          previousValues: {},
          resourceLayersLimit: 1,
          source: mockKnight('half-resource'),
        })

        if (bridgeCleanup.value == undefined || refCleanup.value == undefined)
          throw new Error('Failed to store cleanup managers')

        const countCleanup = vi.fn()

        bridgeCleanup.value.onDispose(countCleanup)
        refCleanup.value.onDispose(countCleanup)

        expect(countCleanup).toHaveBeenCalledTimes(0)

        parentCleanupManager.value.dispose()

        expect(countCleanup).toHaveBeenCalledTimes(2)
      })

      it('should dispose bridge when ref disposes', () => {
        // Removes all relations but the has-one king of a knight for better control
        const vase = fantasyVase.configureRelations(({ hasOne }) => ({
          knights: {
            king: hasOne('kings', { relationKey: 'kingId' }, 'protected'),
          },
        }))

        // Store each cleanup manager construction
        const bridgeCleanup = cleanupManagerInterceptor()

        vi.spyOn(CleanupManagerNamespace, 'CleanupManager').mockImplementation(
          interceptCleanupManagers(
            cleanupManagerInterceptor(),
            bridgeCleanup,
            cleanupManagerInterceptor()
          )
        )

        mockFantasyDatabase({})

        const relations = buildRelations({
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: vase,
          previousValues: {},
          resourceLayersLimit: 1,
          source: mockKnight('half-resource'),
        })

        if (bridgeCleanup.value == undefined)
          throw new Error('Failed to store cleanup managers')

        const bridgeDispose = vi.fn()

        bridgeCleanup.value.onDispose(bridgeDispose)

        expect(bridgeDispose).toHaveBeenCalledTimes(0)

        relations.king.sync.dispose()

        expect(bridgeDispose).toHaveBeenCalledOnce()
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
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
          source,
        })

        expect(relations.knights.value).not.toStrictEqual(
          allKnights.map((knight) => knight)
        )

        expect(relations.knights.value).toStrictEqual(
          knights.map((knight) => knight)
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
            cleanupManager: new CleanupManagerNamespace.CleanupManager(),
            client: fantasyVase,
            previousValues: {},
            resourceLayersLimit: 1,
            source,
          })

          expect(relations.king.value).toStrictEqual(king)

          await updateDatabaseValue('kings', kingId, { age: 9999 })

          expect(relations.king.value).toStrictEqual(king)
        }
      )

      // TODO: check for discounted resourceLayersLimit
      it.todo('should pass the correct params to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            onDispose: vi.fn(),
            getCleanupManager: () =>
              new CleanupManagerNamespace.CleanupManager(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const cleanupManager = new CleanupManagerNamespace.CleanupManager()

        buildRelations({
          cleanupManager,
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
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
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
          source,
        })

        expect(relations.supervisors.value).not.toStrictEqual(
          allKnights.map((knight) => knight)
        )

        expect(relations.supervisors.value).toStrictEqual(
          knights.map((knight) => knight)
        )
      })

      it.todo(
        'should return many-to-many refs that update correctly',
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
            cleanupManager: new CleanupManagerNamespace.CleanupManager(),
            client: fantasyVase,
            previousValues: {},
            resourceLayersLimit: 1,
            source,
          })

          expect(relations.supervisors.value).toStrictEqual(
            knights.map((knight) => knight)
          )

          const newGold = 5000
          await updateDatabaseValue('knights', knightIdA, { gold: newGold })

          expect(relations.supervisors.value).toStrictEqual(
            knights.map((knight) => {
              if (knight.id === knightIdA) knight.gold = newGold

              return knight
            })
          )

          await deleteDatabaseValue('knightsLands', relationToRemoveId)

          expect(relations.supervisors.value).toStrictEqual(
            knights
              .filter((knight) => knight.id !== knightIdA)
              .map((knight) => knight)
          )
        }
      )

      // TODO: check for discounted resourceLayersLimit
      it.todo('should pass the correct params to syncable ref', () => {
        const mockSyncableRef = vi.fn().mockReturnValue({
          sync: {
            onDispose: vi.fn(),
            getCleanupManager: () =>
              new CleanupManagerNamespace.CleanupManager(),
            onBeforeSyncTrigger: vi.fn(),
          },
        })

        vi.spyOn(SyncableRefNamespace, 'syncableRef').mockImplementation(
          mockSyncableRef
        )

        mockFantasyDatabase({})

        const cleanupManager = new CleanupManagerNamespace.CleanupManager()

        buildRelations({
          cleanupManager,
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: 1,
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

  describe('resourceLayersLimit', () => {
    it('raises if resourceLayersLimit is 0', () => {
      const callback = () =>
        buildRelations({
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          source: mockKnight('half-resource'),
          resourceLayersLimit: 0,
        })

      expect(callback).toThrow('resourceLayersLimit is 0')
    })

    it.each([1, 2, 3])(
      'returns correct number of relation layers when resourceLayersLimit is %s',
      async (layers) => {
        const kingId = '1'
        const knightId = '2'

        const { getDatabaseValue } = mockFantasyDatabase({
          knights: { [knightId]: mockKnight('uploadable', { kingId }) },

          kings: { [kingId]: mockKing('uploadable') },
        })

        const source = (await getDatabaseValue('knights', knightId))!

        const relations = buildRelations({
          cleanupManager: new CleanupManagerNamespace.CleanupManager(),
          client: fantasyVase,
          previousValues: {},
          resourceLayersLimit: layers,
          source,
        })

        const check = (
          value: Resource<FantasyVase, 'kings' | 'knights'>,
          remainingLayers: number
        ) => {
          if (value.resourcePath === 'kings') {
            const king = value as Resource<FantasyVase, 'kings'>

            if (remainingLayers === 1) {
              expect(toValue(king.knights)).toBeUndefined()
              return
            }

            expect(toValue(king.knights)).toBeDefined()

            check(toValue(king.knights)[0], remainingLayers - 1)

            return
          }
          const knight = value as Resource<FantasyVase, 'knights'>

          if (remainingLayers === 1) {
            expect(toValue(knight.king)).toBeUndefined()
            return
          }

          expect(toValue(knight.king)).toBeDefined()

          check(toValue(knight.king), remainingLayers - 1)
        }

        check(relations.king.value, layers)
      }
    )
  })
})
