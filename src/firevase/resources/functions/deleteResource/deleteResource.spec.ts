import { mockFantasyDatabase } from '@/tests/mock/backend'

import { fantasyVase, mockKnight } from '@/tests/mock/fantasyVase'
import { deleteResource } from '.'

describe('deleteResource', () => {
  it('should erase the resource', async () => {
    const id = '1'

    const { requireDatabaseValue, indexDatabaseValues } = mockFantasyDatabase({
      knights: {
        [id]: mockKnight('uploadable'),
      },
    })

    await expect(requireDatabaseValue('knights', id)).resolves.toBeDefined()
    await expect(indexDatabaseValues('knights')).resolves.toHaveLength(1)

    await deleteResource(fantasyVase, 'knights', id)

    await expect(requireDatabaseValue('knights', id)).resolves.not.toBeDefined()
    await expect(indexDatabaseValues('knights')).resolves.toHaveLength(0)
  })
})
