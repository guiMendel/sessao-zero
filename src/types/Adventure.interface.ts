import { IndexPlayer } from './Player.interface'

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
  narrators: Array<IndexPlayer>

  /** Lista de jogadores da aventura */
  players: Array<IndexPlayer>
}

/** Define a interface de aventura sem o id */
export type AdventureWithoutId = Omit<Adventure, 'id'>

export interface AdventureFields
  extends Omit<Omit<AdventureWithoutId, 'picture_url'>, 'guild'> {
  /** O id da guilda a qual pertence */
  guildId: number
}

/** Interface retornada no index de aventuras */
export interface IndexAdventure {
  id: number
  name: string

  /** Indica se o jogador responsavel pelo metodo index esta nesta aventura */
  current_player_joined: boolean

  /** Indica a quantidade de jogadores */
  player_count: number

  player_limit: number
  narrators: Array<IndexPlayer>
  picture_url: string
}
