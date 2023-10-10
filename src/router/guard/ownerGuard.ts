import { useCurrentAuth, useCurrentGuild } from '@/stores'
import { RouteLocationNormalized } from 'vue-router'
import { findMeta } from '../utils/'
import { getResourceGetter, snapshotToResources } from '@/api'
import { propertyExtractors } from '@/api/constants/propertyExtractors'

export const ownerGuard = async (to: RouteLocationNormalized) => {
  const {} = getResourceGetter('guilds', {
    snapshotToResources: (content) =>
      snapshotToResources(content, {
        extractProperties: propertyExtractors['guilds'],
      }),
  })

  // Nao ligamos para reatividade aqui
  const user = await useCurrentAuth().user
  const guild = await getGuild()

  // Verifica autenticacao
  if (findMeta(to, 'mustOwnGuild') && guild?.ownerUid != user.value?.uid) {
    return { name: 'home' }
  }
}
