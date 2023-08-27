import { useCurrentPlayer } from '@/stores'
import { Guild, PartialUploadable, Uploadable } from '@/types/'
import { addDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { Ref, computed } from 'vue'
import { useResourceAPI } from './useResourceAPI'

export const useGuildAPI = () => {
  const {
    syncResource,
    desyncResource,
    getResourceDocRef,
    syncedResourceList,
    filterResourceList,
    resourceCollection,
  } = useResourceAPI<Guild>('guilds', (guildUid, guildData) => ({
    name: guildData.name,
    ownerUid: guildData.ownerUid,
    uid: guildUid,
    createdAt: new Date(guildData.createdAt),
    modifiedAt: new Date(guildData.modifiedAt),
  }))

  /** Consome o player atual */
  const { player } = storeToRefs(useCurrentPlayer())

  /** Sincroniza uma guilda e habilita edicao */
  const syncGuild = (uid: string, useGuild?: Ref<Guild | null>) => {
    const guild = syncResource(uid, useGuild)

    return computed({
      get: () => guild.value,

      /** Altera os dados desta guilda */
      set: (newGuild) => {
        // Ignore setting to null or to a desynced guild
        if (newGuild == null || guild.value == null) return

        // Set database data
        const securedData: Omit<PartialUploadable<Guild>, 'createdAt'> = {
          modifiedAt: new Date().toJSON(),
        }

        if (newGuild.name != undefined) securedData.name = newGuild.name
        if (newGuild.ownerUid != undefined)
          securedData.ownerUid = newGuild.ownerUid

        console.log(
          'Updating guild to:',
          JSON.parse(JSON.stringify(securedData))
        )

        updateDoc(getResourceDocRef(guild.value.uid), securedData)
      },
    })
  }

  /** Cria uma nova guilda e define o jogador logado como owner */
  const createGuild = (name: string) => {
    if (player.value == null)
      throw new Error('Impossivel criar guilda sem estar logado')

    const securedData: Uploadable<Guild> = {
      createdAt: new Date().toJSON(),
      modifiedAt: new Date().toJSON(),
      name,
      ownerUid: player.value.uid,
    }

    return addDoc(resourceCollection, securedData)
  }

  // Delete database entry
  const deleteGuild = async (uid: string) => deleteDoc(getResourceDocRef(uid))

  return {
    syncGuild,
    syncedGuildList: syncedResourceList,
    filterGuildList: filterResourceList,
    desyncGuild: desyncResource,
    deleteGuild,
    createGuild,
    getGuildDocRef: getResourceDocRef,
    guildCollection: resourceCollection,
  }
}
