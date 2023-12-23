import { FullInstance, Resource, UnrefedFullInstance } from '@/firevase/resources'
import { toValue } from 'vue'

export const isMember = (
  player?: Resource<'players'>,
  guild?: UnrefedFullInstance<'guilds'> | FullInstance<'guilds'>
) =>
  Boolean(
    guild &&
      player &&
      (guild.ownerUid === player.id ||
        toValue(guild.players).some((member) => member.id === player.id))
  )
