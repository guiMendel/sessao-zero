/** Atributos de um usuario padrao, denominado "jogador" */
export interface Player {
  /** Nome do jogador */
  name: string

  /** Email do jogador */
  email: string

  /** Como ele sera apresentado */
  nickname: string

  /** Id da ultima guilda acessada pelo jogador */
  preferredGuildId: string | null

  /** Sua senha, se estiver disponivel para acesso */
  password?: string

  /** Auto-descricao */
  about?: string

  /** Nivel de acesso do jogador
   * 0 — Padrão
   * 1 — Mestre de guildas
   * 2 — Engenheiro
   */
  accessLevel?: number
}
