/** Define os atributos de uma aventura */
export interface Adventure {
  id: number
  name: string

  description: string

  player_limit: number

  /** Link da imagem da aventura */
  picture_url: string

  /** Info da guilda */
  guild: { name: string; id: number }

  /** Arquivo do banner da aventura */
  picture?: File

  /** Lista de narradores da aventura */
  // narrators: Array<IndexPlayer>

  /** Lista de jogadores da aventura */
  // players: Array<IndexPlayer>
}

/** Define a interface de aventura sem o id */
export type AdventureWithoutId = Omit<Adventure, 'id'>
