import { Resource } from './Resource.interface'

/** Atributos de um usuario padrao, denominado "jogador" */
export interface Player extends Resource {
  /** Nome do jogador */
  name: string

  /** Email do jogador */
  email: string

  /** Como ele sera apresentado */
  nickname: string

  /** Sua senha, se estiver disponivel para acesso */
  password?: string

  /** Auto-descricao */
  about?: string

  admin?: boolean
  // guilds: Array<IndexGuild>
}
