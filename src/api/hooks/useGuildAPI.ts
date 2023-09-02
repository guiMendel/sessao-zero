import { useCurrentPlayer } from '@/stores'
import { Guild } from '@/types/'
import { storeToRefs } from 'pinia'
import { useResourceAPI } from './useResourceAPI'

export const useGuildAPI = () => {
  const api = useResourceAPI<Guild>('guilds')

  /** Consome o player atual */
  const { player } = storeToRefs(useCurrentPlayer())

  /** Cria uma nova guilda e define o jogador logado como owner */
  const createGuild = (name: string) => {
    if (player.value == null)
      throw new Error('Impossivel criar guilda sem estar logado')

    return api.create({ ownerUid: player.value.id, name })
  }

  return { ...api, create: createGuild }
}
