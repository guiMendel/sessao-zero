import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { HalfResourceRelations } from '../..'

export const getTargetIds = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  rawTarget: HalfResourceRelations<C, P>[R] | 'all',
  currentRelationsIds: string[]
): string[] => {
  if (rawTarget === 'all') return currentRelationsIds

  return Array.isArray(rawTarget)
    ? rawTarget.map(({ id }: any) => id)
    : [rawTarget.id]
}
