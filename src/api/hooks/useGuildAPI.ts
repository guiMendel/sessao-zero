import { useCurrentPlayer } from '@/stores'
import { Guild, Player } from '@/types/'
import { storeToRefs } from 'pinia'
import { SmartRelationBuilder } from '..'
import { useResourceAPI } from './useResourceAPI'

export const useGuildAPI = () => {
  const api = useResourceAPI<
    Guild,
    { owner: SmartRelationBuilder<Guild, Player> }
  >('guilds', {
    relations: {
      owner: new SmartRelationBuilder<Guild, Player>('players', {
        foreignKey: 'ownerUid',
      }),
    },
  })

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
