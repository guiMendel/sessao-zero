import { syncableRef } from '@/api/classes'
import { FullInstance } from '@/api/resources'
import { CleanupManager } from '@/utils/classes'
import { DocumentReference, Query } from 'firebase/firestore'

export const mockGuild = (
  overrides: Partial<FullInstance<'guilds'>>
): FullInstance<'guilds'> => ({
  createdAt: new Date(),
  players: syncableRef<'players', Query>(
    'players',
    'empty-query',
    new CleanupManager()
  ),
  id: '1',
  modifiedAt: new Date(),
  name: 'brotherhood',
  owner: syncableRef<'players', DocumentReference>(
    'players',
    'empty-document',
    new CleanupManager()
  ),
  resourcePath: 'guilds',
  allowAdventureSubscription: true,
  listingBehavior: 'public',
  open: true,
  ownerUid: '1',
  requireAdmission: false,
  ...overrides,
})
