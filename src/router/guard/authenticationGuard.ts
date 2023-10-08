import { useCurrentAuth } from '@/stores'
import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'

export const authenticationGuard = async (to: RouteLocationNormalized) => {
  // Nao ligamos para reatividade aqui
  const user = await useCurrentAuth().user

  // Verifica autenticacao
  if (findMeta(to, 'requireAuth') === 'authenticated' && user.value == null) {
    return { name: 'login' }
  }

  if (findMeta(to, 'requireAuth') === 'unauthenticated' && user.value != null) {
    return { name: 'home' }
  }
}
