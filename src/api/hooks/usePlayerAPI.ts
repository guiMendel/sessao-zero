import { Player, Resource } from '@/types/'
import { useResourceAPI } from './useResourceAPI'
import { Ref, ref } from 'vue'

/** API para os players. Note que somente fornece metodos de read. Para fazer operacoes de write, veja useCurrentPlayer */
export const usePlayerAPI = () => {
  const api = useResourceAPI<Player>('players')

  /** Sync de ref (nao possui capacidade de write) */
  const sync = (
    id: string,
    existingRef?: Ref<Resource<Player> | null>
  ): Ref<Resource<Player> | null> => {
    const playerRef = existingRef ?? ref<Resource<Player> | null>(null)

    api.sync(id, playerRef)

    return playerRef
  }

  return {
    resourceCollection: api.resourceCollection,
    getDoc: api.getDoc,
    get: api.get,
    getList: api.getList,
    sync,
    syncList: api.syncList,
    desync: api.desync,
    desyncList: api.desyncList,
  }
}
