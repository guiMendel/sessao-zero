import { useCurrentPlayer } from '@/stores'
import { storeToRefs } from 'pinia'
import { useResource } from './useResource'

export const useGuild = () => {
  const api = useResource('guilds')

  /** Consome o player atual */
  const { player } = storeToRefs(useCurrentPlayer())

  /** Cria uma nova guilda e define o jogador logado como owner */
  const createGuild = (name: string) => {
    if (player.value == null)
      throw new Error('Impossivel criar guilda sem estar logado')

    return api.create({
      ownerUid: player.value.id,
      name,
      allowAdventureSubscription: true,
      requireAdmission: false,
      visibility: 'unlisted',
    })
  }

  return { ...api, create: createGuild }
}
