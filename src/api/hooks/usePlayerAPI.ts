import { Player } from '@/types/'
import { useResourceAPI } from './useResourceAPI'

export const usePlayerAPI = () => {
  const {
    syncResource,
    desyncResource,
    getResourceDocRef,
    syncedResourceList,
    filterResourceList,
    resourceCollection,
  } = useResourceAPI<Player>('players', (playerId, playerData) => ({
    about: playerData.about,
    email: playerData.email,
    name: playerData.name,
    nickname: playerData.nickname,
    admin: playerData.admin,
    id: playerId,
    createdAt: new Date(playerData.createdAt),
    modifiedAt: new Date(playerData.modifiedAt),
  }))

  return {
    syncPlayer: syncResource,
    syncedPlayerList: syncedResourceList,
    filterPlayerList: filterResourceList,
    desyncPlayer: desyncResource,
    getPlayerDocRef: getResourceDocRef,
    playerCollection: resourceCollection,
  }
}
