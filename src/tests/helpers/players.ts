import { syncableRef } from '@/firevase/classes'
import { Player } from '@/api/players'
import { FullInstance, Properties, Resource, Uploadable } from '@/firevase/resources'
import { CleanupManager } from '@/utils/classes'
import { Query } from 'firebase/firestore'

export function mockPlayer(
  overrides?: Partial<FullInstance<'players'>>,
  level?: 'full-instance'
): FullInstance<'players'>

export function mockPlayer(
  overrides: Partial<Resource<'players'>>,
  level: 'resource'
): Resource<'players'>

export function mockPlayer(
  overrides: Partial<Uploadable<'players'>>,
  level: 'uploadable'
): Uploadable<'players'>

export function mockPlayer(
  overrides: Partial<Player>,
  level: 'properties'
): Player

export function mockPlayer(
  overrides?: Partial<FullInstance<'players'> | Uploadable<'players'>>,
  level?: 'properties' | 'resource' | 'full-instance' | 'uploadable'
):
  | FullInstance<'players'>
  | Resource<'players'>
  | Player
  | Uploadable<'players'> {
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

  const resource: Resource<'players'> = {
    ...properties,
    createdAt: new Date(),
    id: '1',
    modifiedAt: new Date(),
    resourcePath: 'players',
  }

  if (level === 'resource') return { ...resource, ...overrides }

  return {
    ...resource,
    guilds: syncableRef<'guilds', Query>(
      'guilds',
      'empty-query',
      new CleanupManager()
    ),
    ownedGuilds: syncableRef<'guilds', Query>(
      'guilds',
      'empty-query',
      new CleanupManager()
    ),
    ...overrides,
  }
}
