/** Defines the attributes for a regular user. May or may not contain the auth fields */
export interface Guild {
  id: number
  name: string

  // players: Array<IndexPlayer>
  // adventures: Array<IndexAdventure>
  current_player_joined: boolean
}

/** Defines the attributes for a regular user, without the id field */
export type GuildWithoutId = Omit<Guild, 'id'>
