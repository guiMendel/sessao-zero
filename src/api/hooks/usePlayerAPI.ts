import { Player } from '@/types/'
import { useResourceAPI } from './useResourceAPI'

/** API para os players. Note que somente fornece metodos de read. Para fazer operacoes de write, veja useCurrentPlayer */
export const usePlayerAPI = () => {
  const api = useResourceAPI<Player>('players')

  // Filtra metods de escrita e delecao
  return {
    resourceCollection: api.resourceCollection,
    getDoc: api.getDoc,
    get: api.get,
    getList: api.getList,
    sync: api.sync,
    syncList: api.syncList,
  }
}
