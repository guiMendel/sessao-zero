import { syncableRef } from '@/api/classes'
import { FullInstance } from '@/api/resources'
import { CleanupManager } from '@/utils/classes'
import { Query } from 'firebase/firestore'

export const mockPlayer = (
  overrides?: Partial<FullInstance<'players'>>
): FullInstance<'players'> => ({
  about: 'about',
  createdAt: new Date(),
  admin: false,
  email: 'scooby@doo.com',
  guilds: syncableRef<'guilds', Query>(
    'guilds',
    'empty-query',
    new CleanupManager()
  ),
  id: '1',
  modifiedAt: new Date(),
  name: 'scooby',
  nickname: 'scoo',
  ownedGuilds: syncableRef<'guilds', Query>(
    'guilds',
    'empty-query',
    new CleanupManager()
  ),
  resourcePath: 'players',
  ...overrides,
})
