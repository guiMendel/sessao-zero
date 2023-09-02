
/** Define os atributos de uma aventura */
export interface Adventure {
  name: string

  description: string

  playerLimit: number

  /** Link da imagem da aventura */
  pictureUrl: string

  /** Info da guilda */
  // guild: { name: string; id: number }

  /** Arquivo do banner da aventura */
  picture?: File

  /** Lista de narradores da aventura */
  // narrators: Array<IndexPlayer>

  /** Lista de jogadores da aventura */
  // players: Array<IndexPlayer>
}
