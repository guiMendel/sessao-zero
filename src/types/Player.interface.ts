import { IndexGuild } from './Guild.interface'

/** Defines the attributes for a regular user. May or may not contain the auth fields */
export interface Player extends Partial<AuthenticationFields> {
  id: number
  name: string
  nickname: string
  admin: boolean
  guilds: Array<IndexGuild>

  registration?: string
}

/** Defines the attributes for a regular user, without the id field */
export type PlayerWithoutId = Omit<Player, 'id'>

/** Defines the fields necessary for player authentication */
export interface AuthenticationFields {
  email: string
  password: string
}

/** Define os campos que devem ser preenchidos para criar um jogardor */
export type PlayerFields = Omit<Omit<PlayerWithoutId, 'admin'>, 'guilds'>

/** Formato retornado por metodos de indexagem */
export interface IndexPlayer {
  id: number
  nickname: string
}
