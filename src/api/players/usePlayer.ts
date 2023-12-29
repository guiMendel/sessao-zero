import { useResource } from '@/firevase/resources'
import { vase } from '..'

/** API para os players. Note que somente fornece metodos de read. Para fazer operacoes de write, veja useCurrentPlayer */
export const usePlayer = () => {
  const api = useResource(vase, 'players')

  // Filtra metods de escrita e delecao
  return {
    resourceCollection: api.resourceCollection,
    docWithId: api.docWithId,
    get: api.get,
    getList: api.getList,
    sync: api.sync,
    syncList: api.syncList,
  }
}
