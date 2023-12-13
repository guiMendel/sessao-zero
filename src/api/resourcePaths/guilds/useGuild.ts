import { where } from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { GetListMethod, SyncListMethod, useCurrentPlayer } from '../..'
import { useResource } from '../../resources/hooks/useResource'

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
      listingBehavior: 'unlisted',
      open: true,
    })
  }

  const getList: GetListMethod<'guilds'> = (filters) =>
    api.getList([...(filters ?? []), where('listingBehavior', '==', 'public')])

  const syncList: SyncListMethod<'guilds'> = (filters, existingRef) =>
    api.syncList(
      [...(filters ?? []), where('listingBehavior', '==', 'public')],
      existingRef
    )

  return { ...api, create: createGuild, getList, syncList }
}
