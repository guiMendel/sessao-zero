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
  } = useResourceAPI<Player>('players', (playerUid, playerData) => ({
    about: playerData.about,
    email: playerData.email,
    name: playerData.name,
    nickname: playerData.nickname,
    admin: playerData.admin,
    uid: playerUid,
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
