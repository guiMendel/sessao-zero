import { useCurrentAuth } from '@/stores'
import { useCurrentGuild } from '@/utils'
import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'

export const ownerGuard = async (to: RouteLocationNormalized) => {
  const { getGuild } = useCurrentGuild()

  // Nao ligamos para reatividade aqui
  const user = await useCurrentAuth().user
  const guild = await getGuild()

  // Verifica autenticacao
  if (findMeta(to, 'mustOwnGuild') && guild?.ownerUid != user.value?.uid) {
    return { name: 'home' }
  }
}
