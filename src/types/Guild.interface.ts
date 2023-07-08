import { IndexAdventure } from './Adventure.interface'
import { IndexPlayer } from './Player.interface'

/** Defines the attributes for a regular user. May or may not contain the auth fields */
export interface Guild {
  id: number
  name: string

  players: Array<IndexPlayer>
  adventures: Array<IndexAdventure>
  current_player_joined: boolean
}

/** Defines the attributes for a regular user, without the id field */
export type GuildWithoutId = Omit<Guild, 'id'>

export interface GuildFields {
  name: string
}

/** Formato retornado por metodos de indexagem */
export interface IndexGuild {
  id: number
  name: string
  current_player_joined: boolean
}
