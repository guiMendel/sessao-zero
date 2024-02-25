import { vase } from '@/api'
import { setUpFirebaseMocks } from '../firebase'
import { makeResourceMocker } from '../makeResourceMocker'

setUpFirebaseMocks()

export const mockGuild = makeResourceMocker(vase, 'guilds', {
  name: [
    'The Crimson Blades',
    'The Azure Archers',
    'The Golden Griffins',
    'The Emerald Enchanters',
    'The Silver Sentinels',
    'The Shadow Seekers',
    'The Mystic Marauders',
    'The Celestial Circle',
    'The Sapphire Sorcerers',
    'The Ruby Rogues',
    'The Diamond Defenders',
    'The Obsidian Order',
    'The Frostborn Fellowship',
    'The Thunder Thieves',
    'The Starlight Scholars',
    'The Iron Inquisitors',
    'The Twilight Traders',
    'The Fiery Phoenix',
    'The Eternal Explorers',
    'The Whispering Witches',
  ],
  allowAdventureSubscription: [true, false],
  listingBehavior: ['public', 'unlisted'],
  open: [true, false],
  ownerUid: '1',
  requireAdmission: [true, false],
})
