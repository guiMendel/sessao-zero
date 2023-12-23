import { Vase, vase } from '@/api'
import { db } from '@/api/firebase'
import { Guild } from '@/api/guilds'
import { syncableRef } from '@/firevase/Syncable'
import { HalfResource, Resource, Uploadable } from '@/firevase/resources'
import { CleanupManager } from '@/utils/classes'
import { DocumentReference, Query, collection, doc } from 'firebase/firestore'
import { setUpFirebaseMocks } from './firebase'

setUpFirebaseMocks()

export function mockGuild(
  overrides?: Partial<Resource<Vase, 'guilds'>>,
  level?: 'resource'
): Resource<Vase, 'guilds'>

export function mockGuild(
  overrides: Partial<HalfResource<Vase, 'guilds'>>,
  level: 'half-resource'
): HalfResource<Vase, 'guilds'>

export function mockGuild(
  overrides: Partial<Uploadable<Vase, 'guilds'>>,
  level: 'uploadable'
): Uploadable<Vase, 'guilds'>

export function mockGuild(overrides: Partial<Guild>, level: 'properties'): Guild

export function mockGuild(
  overrides?: Partial<Resource<Vase, 'guilds'> | Uploadable<Vase, 'guilds'>>,
  level?: 'properties' | 'resource' | 'half-resource' | 'uploadable'
):
  | Resource<Vase, 'guilds'>
  | HalfResource<Vase, 'guilds'>
  | Guild
  | Uploadable<Vase, 'guilds'> {
  const ownerUid = overrides?.ownerUid ?? '1'

  const properties: Guild = {
    name: 'brotherhood',
    allowAdventureSubscription: true,
    listingBehavior: 'public',
    open: true,
    ownerUid,
    requireAdmission: false,
  }

  if (level === 'properties') return { ...properties, ...overrides }

  if (level === 'uploadable')
    return {
      ...properties,
      createdAt: new Date().toString(),
      modifiedAt: new Date().toString(),
      ...overrides,
    }

  const resource: HalfResource<Vase, 'guilds'> = {
    ...properties,
    createdAt: new Date(),
    id: '1',
    modifiedAt: new Date(),
    resourcePath: 'guilds',
  }

  if (level === 'half-resource') return { ...resource, ...overrides }

  return {
    ...resource,
    players: syncableRef<Vase, 'players', Query>(
      vase,
      'players',
      'empty-query',
      new CleanupManager()
    ),
    owner: syncableRef<Vase, 'players', DocumentReference>(
      vase,
      'players',
      doc(collection(db, 'players'), ownerUid),
      new CleanupManager()
    ),
    ...overrides,
  }
}
