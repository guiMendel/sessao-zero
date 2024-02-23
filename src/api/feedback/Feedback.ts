export type Feedback = {
  /** Assunto */
  subject: string

  /** Descrição geral */
  description: string

  /** Se o remetente quiser compartilhar um meio de comunicação */
  replyTo: string | undefined

  /** Tipo do feedback recebido */
  type: 'feedback' | 'bug'

  /** Description of how to achieve described information */
  stepsToReproduce: string

  /** Last 3 errors in JSON array */
  lastErrors: string

  // Devices settings

  /** Value of navigator.userAgent */
  userAgent: string

  /** Value of screen.width */
  screenWidth: number

  /** Value of screen.height */
  screenHeight: number

  /** Value of window.devicePixelRatio */
  devicePixelRatio: number
}
