import { db } from '@/api'
import { useCurrentAuth } from '@/stores'
import { doc, getDoc } from 'firebase/firestore'
import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'

export const ownerGuard = async (to: RouteLocationNormalized) => {
  // Nao ligamos para reatividade aqui
  const user = await useCurrentAuth().user

  const { guildId } = to.params

  // Pega a guilda de id correspondente a rota
  const guildDoc =
    guildId && typeof guildId === 'string'
      ? doc(db, 'guilds', guildId)
      : undefined

  // Verifica autenticacao
  if (
    findMeta(to, 'mustOwnGuild') &&
    (!guildDoc || (await getDoc(guildDoc)).data()?.ownerUid != user.value?.uid)
  ) {
    return { name: 'home' }
  }
}
