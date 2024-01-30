import { Vase } from '@/api'
import { HalfResource, Resource, UnrefedResource } from '@/firevase/resources'
import { toValue } from 'vue'

/** Verifica se o jogador eh dono ou membro da guilda */
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
