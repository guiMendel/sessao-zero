import { Vase } from '@/api'
import { Resource } from '@/firevase/resources'
import { toValue } from 'vue'

export const isNarrator = (
  playerId: string,
  adventure: Resource<Vase, 'adventures'>
) =>
  Boolean(
    toValue(adventure.narrators)?.some((narrator) => narrator.id === playerId)
  )
