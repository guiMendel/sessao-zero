import { Vase, vase } from '@/api'
import { Player } from '@/api/players'
import { syncableRef } from '@/firevase/Syncable'
import { HalfResource, Resource, Uploadable } from '@/firevase/resources'
import { CleanupManager } from '@/utils/classes'
import { Query } from 'firebase/firestore'
import { setUpFirebaseMocks } from './firebase'

setUpFirebaseMocks()

export function mockPlayer(
  overrides?: Partial<Resource<Vase, 'players'>>,
  level?: 'resource'
): Resource<Vase, 'players'>

export function mockPlayer(
  overrides: Partial<HalfResource<Vase, 'players'>>,
  level: 'half-resource'
): HalfResource<Vase, 'players'>

export function mockPlayer(
  overrides: Partial<Uploadable<Vase, 'players'>>,
  level: 'uploadable'
): Uploadable<Vase, 'players'>

export function mockPlayer(
  overrides: Partial<Player>,
  level: 'properties'
): Player

export function mockPlayer(
  overrides?: Partial<Resource<Vase, 'players'> | Uploadable<Vase, 'players'>>,
  level?: 'properties' | 'half-resource' | 'resource' | 'uploadable'
):
  | Resource<Vase, 'players'>
  | HalfResource<Vase, 'players'>
  | Player
  | Uploadable<Vase, 'players'> {
  const properties: Player = {
    about: 'about',
    admin: false,
    email: 'scooby@doo.com',
    name: 'scooby',
    nickname: 'scoo',
  }

  if (level === 'properties') return { ...properties, ...overrides }

  if (level === 'uploadable')
    return {
      ...properties,
      createdAt: new Date().toString(),
      modifiedAt: new Date().toString(),
      ...overrides,
    }

  const resource: HalfResource<Vase, 'players'> = {
    ...properties,
    createdAt: new Date(),
    id: '1',
    modifiedAt: new Date(),
    resourcePath: 'players',
  }

  if (level === 'half-resource') return { ...resource, ...overrides }

  return {
    ...resource,
    guilds: syncableRef<Vase, 'guilds', Query>(
      vase,
      'guilds',
      'empty-query',
      new CleanupManager()
    ),
    ownedGuilds: syncableRef<Vase, 'guilds', Query>(
      vase,
      'guilds',
      'empty-query',
      new CleanupManager()
    ),
    ...overrides,
  }
}
