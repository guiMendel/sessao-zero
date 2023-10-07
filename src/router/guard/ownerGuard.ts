import { useCurrentPlayer } from '@/stores/useCurrentPlayer'
import { storeToRefs } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'
import { useCurrentGuild } from '@/utils'

export const ownerGuard = async (to: RouteLocationNormalized) => {
  const { player } = storeToRefs(useCurrentPlayer())
  const { getGuild } = useCurrentGuild()

  const guild = await getGuild()

  // Verifica autenticacao
  if (findMeta(to, 'mustOwnGuild') && guild?.ownerUid != player.value?.id) {
    return { name: 'home' }
  }
}
