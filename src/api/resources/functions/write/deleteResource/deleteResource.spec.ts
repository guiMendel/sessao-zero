import { getMockDatabase } from '@/tests/mock/firebase'
import { deleteResource } from '.'
import { mockPlayer } from '@/tests'

describe('deleteResource', () => {
  it('should erase the resource', () => {
    const id = '1'

    const { getDatabaseValue, indexDatabaseValues } = getMockDatabase({
      [id]: mockPlayer({}, 'uploadable'),
    })

    expect(getDatabaseValue(id)).toBeDefined()
    expect(indexDatabaseValues()).toHaveLength(1)

    deleteResource('players', id)

    expect(getDatabaseValue(id)).not.toBeDefined()
    expect(indexDatabaseValues()).toHaveLength(0)
  })
})
