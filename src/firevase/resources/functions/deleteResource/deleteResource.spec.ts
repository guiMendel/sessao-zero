import { createDatabase, mockFantasyDatabase } from '@/tests/mock/backend'

import {
  fantasyVase,
  mockKing,
  mockKnight,
  mockLand,
} from '@/tests/mock/fantasyVase'
import { deleteResource } from '.'

describe('deleteResource', () => {
  it('should erase the resource', async () => {
    const id = '1'

    const { getDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
      knights: {
        [id]: mockKnight('uploadable'),
      },
    })

    await expect(getDatabaseValue('knights', id)).resolves.toBeDefined()
    await expect(indexDatabaseValues('knights')).resolves.toHaveLength(1)

    await deleteResource(fantasyVase, 'knights', id)

    await expect(getDatabaseValue('knights', id)).resolves.not.toBeDefined()
    await expect(indexDatabaseValues('knights')).resolves.toHaveLength(0)
  })

  it('should remove id references from has-many relations, even if protected', async () => {
    const vase = fantasyVase.configureRelations(({ hasMany, hasOne }) => ({
      kings: {
        knights: hasMany('knights', { relationKey: 'kingId' }),
      },

      knights: {
        king: hasOne('kings', { relationKey: 'kingId' }, 'protected'),
      },
    }))

    const kingId = '1'
    const knightId = '2'

    const { requireDatabaseValue } = createDatabase(vase).init({
      kings: {
        [kingId]: mockKing('uploadable'),
      },

      knights: {
        [knightId]: mockKnight('uploadable', { kingId }),
      },
    })

    await expect(
      requireDatabaseValue('knights', knightId)
    ).resolves.toHaveProperty('kingId', kingId)

    await deleteResource(vase, 'kings', kingId)

    await expect(
      requireDatabaseValue('knights', knightId)
    ).resolves.toHaveProperty('kingId', undefined)
  })

  it('should remove relation entries from many-to-many relations', async () => {
    const knightId = '1'
    const landId = '2'

    const { indexDatabaseValues } = mockFantasyDatabase({
      knights: {
        [knightId]: mockKnight('uploadable'),
      },

      lands: {
        [landId]: mockLand('uploadable'),
      },

      knightsLands: {
        [3]: { knights: knightId, lands: landId },
      },
    })

    await expect(indexDatabaseValues('knightsLands')).resolves.toHaveLength(1)

    await deleteResource(fantasyVase, 'knights', knightId)

    await expect(indexDatabaseValues('knightsLands')).resolves.toHaveLength(0)
  })
})
