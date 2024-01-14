import { GetListMethod, Resource, SyncListMethod } from '@/firevase/resources'
import { where } from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { Vase, vase } from '..'
import { useResource } from '../../firevase/resources/hooks/useResource'
import { useCurrentPlayer } from '../players'

export const useGuild = () => {
  const api = useResource(vase, 'guilds')

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
      listingBehavior: 'public',
      open: true,
    })
  }

  type GetList = GetListMethod<Vase, 'guilds', Resource<Vase, 'guilds'>[]>

  const getList: GetList = (filters) =>
    api.getList([...(filters ?? []), where('listingBehavior', '==', 'public')])

  const syncList: SyncListMethod<Vase, 'guilds'> = (filters, existingRef) =>
    api.syncList(
      [...(filters ?? []), where('listingBehavior', '==', 'public')],
      existingRef
    )

  return { ...api, create: createGuild, getList, syncList }
}
