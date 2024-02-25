import { Vase } from '@/api'
import {
  FantasyVase,
  mockKing,
  mockKnight,
  mockLand,
  mockMission,
} from './fantasyVase'
import { mockGuild, mockPlayer } from './vase'

export const mocksTable = {
  guilds: mockGuild,
  kings: mockKing,
  knights: mockKnight,
  lands: mockLand,
  missions: mockMission,
  players: mockPlayer,
} satisfies Partial<
  Record<
    keyof FantasyVase['_tsAnchor'] | keyof Vase['_tsAnchor'],
    (level?: any, overrides?: any) => any
  >
>

export type MocksTable = typeof mocksTable
