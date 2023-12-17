import { RealDate, getMockDatabase } from '@/tests/mock/firebase'

import { ResourcePath } from '@/api/resources'
import { updateResource } from '.'
import { collection, updateDoc } from 'firebase/firestore'
import { db } from '@/api/firebase'
import { mockPlayer } from '@/tests'
import { Player } from '@/api/resourcePaths/players'

const resourcePath = 'test-resource' as ResourcePath

describe('updateResource', () => {
  it('should not upload password, createdAt or id, and correctly update the modifiedAt property', async () => {
    const properties = {
      count: 10,
      id: '25',
      name: 'shaggy',
      password: '123',
      createdAt: new RealDate(1999, 6),
      modifiedAt: new RealDate(1999, 6),
    }

    const realId = '1'

    await updateResource(resourcePath, realId, properties)

    expect(updateDoc).toHaveBeenCalledWith(
      { id: realId, collection: collection(db, resourcePath) },
      {
        count: properties.count,
        name: properties.name,
        modifiedAt: new Date().toJSON(),
      }
    )
  })

  it('should update the doc with the provided properties', async () => {
    const originalProperties = {
      count: 1,
      name: 'scooby',
    }

    const newProperties = {
      count: 10,
      name: 'shaggy',
    }

    const id = '1'

    const { getDatabaseValue } = getMockDatabase({
      [id]: mockPlayer(originalProperties, 'uploadable'),
    })

    await updateResource(resourcePath, id, newProperties)

    expect(getDatabaseValue(id)).toStrictEqual(
      expect.objectContaining(newProperties)
    )
  })

  it('should set the properties when overwrite is true', async () => {
    const originalProperties = {
      name: 'scooby',
      nickname: 'bobby',
    }

    const newProperties = {
      nickname: 'swags',
    } as unknown as Player

    const id = '1'

    const { getDatabaseValue } = getMockDatabase({
      [id]: mockPlayer(originalProperties, 'uploadable'),
    })

    await updateResource(resourcePath, id, newProperties, { overwrite: true })

    expect(getDatabaseValue(id)).toStrictEqual(
      expect.objectContaining(newProperties)
    )

    expect(getDatabaseValue(id).name).not.toBeDefined()
  })
})
