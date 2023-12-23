import { getMockDatabase } from '@/tests/mock/backend'

import { mockPlayer } from '@/tests'
import { deleteResource } from '.'

describe('deleteResource', () => {
  it('should erase the resource', async () => {
    const id = '1'

    const { getDatabaseValue, indexDatabaseValues } = getMockDatabase({
      players: {
        [id]: mockPlayer({}, 'uploadable'),
      },
    })

    await expect(getDatabaseValue('players', id)).resolves.toBeDefined()
    await expect(indexDatabaseValues('players')).resolves.toHaveLength(1)

    await deleteResource('players', id)

    await expect(getDatabaseValue('players', id)).resolves.not.toBeDefined()
    await expect(indexDatabaseValues('players')).resolves.toHaveLength(0)
  })
})
