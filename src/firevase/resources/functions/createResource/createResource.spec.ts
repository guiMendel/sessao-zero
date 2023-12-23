import { RealDate, getMockDatabase } from '@/tests/mock/firebase'

import { db } from '@/api/firebase'
import { Player } from '@/api/players'
import { mockPlayer } from '@/tests'
import { addDoc, collection } from 'firebase/firestore'
import { createResource } from '.'

describe('createResource', () => {
  it('should not upload password or id, and should override modifiedAt and createdAt', () => {
    const properties = {
      count: 1,
      id: '1',
      name: 'scooby',
      password: '123',
      createdAt: new RealDate(1999, 6),
      modifiedAt: new RealDate(1999, 6),
    }

    createResource('players', properties as unknown as Player)

    expect(addDoc).toHaveBeenCalledWith(collection(db, 'players'), {
      count: properties.count,
      name: properties.name,
      createdAt: new Date().toJSON(),
      modifiedAt: new Date().toJSON(),
    })
  })

  it('should add the doc with the provided properties', async () => {
    const properties = {
      name: 'scooby',
      about: 'memes',
    }

    const { getDatabaseValue } = getMockDatabase({})

    const { id } = await createResource(
      'players',
      mockPlayer(properties, 'uploadable')
    )

    await expect(getDatabaseValue('players', id)).resolves.toStrictEqual(
      expect.objectContaining(properties)
    )
  })

  it('should use the id passed as second argument', async () => {
    const id = 'noice'

    const properties = {
      name: 'scooby',
      about: 'memes',
    }

    const { getDatabaseValue } = getMockDatabase({})

    createResource('players', mockPlayer(properties, 'uploadable'), id)

    await expect(getDatabaseValue('players', id)).resolves.toStrictEqual(
      expect.objectContaining(properties)
    )
  })
})
