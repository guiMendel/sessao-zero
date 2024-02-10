/** Define os atributos de uma aventura */
export interface Adventure {
  name: string

  description: string

  guildId: string

  /** Numero maximo de jogadores */
  playerLimit: number

  /** Permite a entrada de novos jogadores na aventura */
  open: boolean

  // TODO: em vez de ficar tudo amarelo, tanto a guidal quanto a aventura precisar ter um icone que indica essa necessidade
  // talvez um envelope amarelo
  /** Quando ativado, jogadores nao podem entrar diretamente — eles enviam uma solicitaçao de admissão */
  requireAdmission: boolean
}
