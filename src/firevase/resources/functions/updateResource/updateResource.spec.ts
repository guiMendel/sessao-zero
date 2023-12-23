import { RealDate, getMockDatabase } from '@/tests/mock/backend'

import { db } from '@/api/firebase'
import { Player } from '@/api/players'
import { mockPlayer } from '@/tests'
import { collection, updateDoc } from 'firebase/firestore'
import { updateResource } from '.'

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

    await updateResource('players', realId, properties)

    expect(updateDoc).toHaveBeenCalledWith(
      { id: realId, collection: collection(db, 'players') },
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
      players: { [id]: mockPlayer(originalProperties, 'uploadable') },
    })

    await updateResource('players', id, newProperties)

    await expect(getDatabaseValue('players', id)).resolves.toStrictEqual(
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
      players: { [id]: mockPlayer(originalProperties, 'uploadable') },
    })

    await updateResource('players', id, newProperties, { overwrite: true })

    const result = await getDatabaseValue('players', id)

    expect(result).toStrictEqual(expect.objectContaining(newProperties))

    expect(result!.name).not.toBeDefined()
  })
})
