import { useResource } from '../../firevase/resources/hooks/useResource'

/** API para os players. Note que somente fornece metodos de read. Para fazer operacoes de write, veja useCurrentPlayer */
export const usePlayer = () => {
  const api = useResource('players')

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
