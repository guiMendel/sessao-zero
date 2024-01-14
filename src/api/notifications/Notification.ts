/** Atributos de uma notificaçao recebida por um jogador */
export interface Notification {
  /** Corpo HTML da notificaçao */
  body: string

  /** Se a notificaçao ja foi lida */
  unread: boolean

  /** Id do jogador dono */
  playerId: string
}
