import { Vase } from '@/api'
import { HalfResource, Resource, UnrefedResource } from '@/firevase/resources'
import { toValue } from 'vue'

export const isMember = (
  player?: HalfResource<Vase, 'players'>,
  guild?: UnrefedResource<Vase, 'guilds'> | Resource<Vase, 'guilds'>
) =>
  Boolean(
    guild &&
      player &&
      (guild.ownerUid === player.id ||
        toValue(guild.players).some((member) => member.id === player.id))
  )
