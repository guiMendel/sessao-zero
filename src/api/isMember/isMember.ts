import { Vase } from '@/api'
import { HalfResource, Resource } from '@/firevase/resources'
import { toValue } from 'vue'
import { isNarrator } from '../adventures'

/** Verifica se o jogador eh dono ou membro da guilda */
export const isMember = (
  player?: HalfResource<Vase, 'players'>,
  target?: Resource<Vase, 'guilds'> | Resource<Vase, 'adventures'>,
  options?: { ignoreOwnership: boolean }
) => {
  if (!target || !player) return false

  if (target.resourcePath === 'guilds')
    return (
      (!options?.ignoreOwnership && target.ownerUid === player.id) ||
      toValue(target.players).some((member) => member.id === player.id)
    )

  return (
    toValue(target.players).some((member) => member.id === player.id) ||
    (!options?.ignoreOwnership && isNarrator(player.id, target))
  )
}
