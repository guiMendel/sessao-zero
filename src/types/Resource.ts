import { Guild, Player } from '.'

export type ResourcePaths = 'players' | 'guilds'

export type Resource<P> = P & {
  createdAt: Date
  modifiedAt: Date
  id: string
}

export type Uploadable<P> = P & {
  modifiedAt: string
  createdAt: string
}

export type ResourceProperties = Guild | Player

/** Maps resource types to their proerty definitions */
export interface ResourceTypeToProperties {
  players: Player
  guilds: Guild
}
