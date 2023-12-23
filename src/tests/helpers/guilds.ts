import { syncableRef } from '@/firevase/classes'
import { db } from '@/api/firebase'
import { Guild } from '@/api/guilds'
import { FullInstance, Resource, Uploadable } from '@/firevase/resources'
import { CleanupManager } from '@/utils/classes'
import { DocumentReference, Query, collection, doc } from 'firebase/firestore'

export function mockGuild(
  overrides?: Partial<FullInstance<'guilds'>>,
  level?: 'full-instance'
): FullInstance<'guilds'>

export function mockGuild(
  overrides: Partial<Resource<'guilds'>>,
  level: 'resource'
): Resource<'guilds'>

export function mockGuild(
  overrides: Partial<Uploadable<'guilds'>>,
  level: 'uploadable'
): Uploadable<'guilds'>

export function mockGuild(overrides: Partial<Guild>, level: 'properties'): Guild

export function mockGuild(
  overrides?: Partial<FullInstance<'guilds'> | Uploadable<'guilds'>>,
  level?: 'properties' | 'resource' | 'full-instance' | 'uploadable'
): FullInstance<'guilds'> | Resource<'guilds'> | Guild | Uploadable<'guilds'> {
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

  const resource: Resource<'guilds'> = {
    ...properties,
    createdAt: new Date(),
    id: '1',
    modifiedAt: new Date(),
    resourcePath: 'guilds',
  }

  if (level === 'resource') return { ...resource, ...overrides }

  return {
    ...resource,
    players: syncableRef<'players', Query>(
      'players',
      'empty-query',
      new CleanupManager()
    ),
    owner: syncableRef<'players', DocumentReference>(
      'players',
      doc(collection(db, 'players'), ownerUid),
      new CleanupManager()
    ),
    ...overrides,
  }
}
