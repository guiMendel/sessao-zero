import { GetListMethod, Resource, SyncListMethod } from '@/firevase/resources'
import { where } from 'firebase/firestore'
import { Vase, vase } from '..'
import { useResource } from '../../firevase/resources/hooks/useResource'
import { useCurrentPlayer } from '../players'
import { CodeError } from '@/utils/classes'

export const useGuild = () => {
  const api = useResource(vase, 'guilds')

  /** Consome o player atual */
  const { player } = useCurrentPlayer()

  /** Cria uma nova guilda e define o jogador logado como owner */
  const createGuild = (name: string) => {
    if (player.value == null) throw new CodeError('local/require-auth')

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

  // TODO: adicionar metodos de add e remove player pra encapsular aquela funcao useJoinGuild

  return { ...api, create: createGuild, getList, syncList }
}
