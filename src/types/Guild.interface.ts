import { Resource } from '.'

/** Defines the attributes for a regular user. May or may not contain the auth fields */
export interface Guild extends Resource {
  name: string
  ownerUid: string

  // players: Array<IndexPlayer>
  // adventures: Array<IndexAdventure>
  // current_player_joined: boolean
}
