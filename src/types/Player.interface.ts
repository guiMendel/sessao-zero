import { Resource } from './Resource.interface'

/** Atributos de um usuario padrao, denominado "jogador" */
export interface Player extends PlayerResource {
  id: string
}

/** Atributos do jogador como armazenados no firestore */
export interface PlayerResource extends Resource {
  /** Nome do jogador */
  name: string
  /** Como ele sera apresentado */
  nickname: string
  /** Auto-descricao */
  about: string

  admin?: boolean
  // guilds: Array<IndexGuild>

  email: string
  password: string
}
