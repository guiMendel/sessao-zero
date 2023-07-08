import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'
import { storeToRefs } from 'pinia'
import { useCurrentPlayer } from '../../stores/useCurrentPlayer'

export const authenticationGuard = (to: RouteLocationNormalized) => {
  const { player } = storeToRefs(useCurrentPlayer())

  // Verifica autenticacao
  if (
    findMeta(to, 'requireAuth') === 'authenticated' &&
    player.value == undefined
  ) {
    return { name: 'login' }
  }

  if (
    findMeta(to, 'requireAuth') === 'unauthenticated' &&
    player.value != undefined
  ) {
    return { name: 'home' }
  }
}
