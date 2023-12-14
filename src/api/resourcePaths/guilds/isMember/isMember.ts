import { FullInstance, Resource } from '@/api/resources'
import { toValue } from 'vue'

export const isMember = (
  player: Resource<'players'>,
  guild: FullInstance<'guilds'>
) =>
  guild.ownerUid === player.id ||
  toValue(guild.players).some((member) => member.id === player.id)
