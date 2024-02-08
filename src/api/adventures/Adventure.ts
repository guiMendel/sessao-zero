/** Define os atributos de uma aventura */
export interface Adventure {
  name: string

  description: string

  guildId: string

  /** Numero maximo de jogadores */
  playerLimit: number

  /** Permite a entrada de novos jogadores na aventura */
  open: boolean

  /** Quando ativado, jogadores nao podem entrar diretamente — eles enviam uma solicitaçao de admissão */
  requireAdmission: boolean
}
