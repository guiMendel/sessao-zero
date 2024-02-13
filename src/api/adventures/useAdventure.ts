import { addRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { Adventure } from '.'
import { Vase, vase } from '..'
import { useResource } from '../../firevase/resources/hooks/useResource'
import { useCurrentGuild } from '../guilds'
import { useCurrentPlayer } from '../players'

export const useAdventure = () => {
  const api = useResource(vase, 'adventures')

  /** Consome o player atual */
  const { player } = useCurrentPlayer()

  /** Consome a guilda atual */
  const { guild } = useCurrentGuild()

  /** Cria uma nova adventurea e define o jogador logado como narrador */
  const createAdventure = async (params: Omit<Adventure, 'guildId'>) => {
    if (player.value == null)
      throw new Error('Impossivel criar aventura sem estar logado')

    if (guild.value == null)
      throw new Error(
        'Impossivel criar aventura sem ter uma guilda selecionada'
      )

    const { id } = await api.create({
      ...params,
      guildId: guild.value.id,
    })

    // TODO: mudar os relation add, set & remove para
    // 1. Nao precisar mais receber o primeiro parametro, que pode ser derivado do segundo
    // 2. Receber os ids dos targets somente, sem precisar de um HalfResource
    await addRelation(vase, player.value, 'narratorAdventures', [
      { id } as HalfResource<Vase, 'adventures'>,
    ])

    return id
  }

  return { ...api, create: createAdventure }
}
