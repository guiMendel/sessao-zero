/** Defines the attributes for a regular user. May or may not contain the auth fields */
export interface Guild {
  name: string
  ownerUid: string

  /** Permite jogadores se inscreverem nas aventuras desta guilda */
  allowAdventureSubscription: boolean

  /** Controla se jogadores poderao ver essa guilda listada no indice */
  visibility: 'unlisted' | 'public'

  /** Quando ativado, jogadores nao podem entrar diretamente — eles enviam uma solicitaçao de admissão */
  requireAdmission: boolean

  // players: Array<IndexPlayer>
  // adventures: Array<IndexAdventure>
  // current_player_joined: boolean
}
