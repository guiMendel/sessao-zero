import { Vase } from '@/api'
import { HalfResource, Resource } from '@/firevase/resources'
import { toValue } from 'vue'
import { isNarrator } from '../adventures'

/** Verifica se o jogador eh dono ou membro da guilda */
export const isMember = (
  player?: HalfResource<Vase, 'players'>,
  target?: Resource<Vase, 'guilds'> | Resource<Vase, 'adventures'>
) => {
  if (!target || !player) return false

  if (target.resourcePath === 'guilds')
    return (
      target.ownerUid === player.id ||
      toValue(target.players).some((member) => member.id === player.id)
    )

  return (
    toValue(target.players).some((member) => member.id === player.id) ||
    isNarrator(player.id, target)
  )
}
