import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { RelationDefinitionFrom, RelationType, Relations } from '../..'

export const getDefinition = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof Relations<C, P>,
  T extends RelationType
>(
  client: C,
  path: P,
  relation: R,
  _: T
) =>
  client.relationSettings?.[path]?.[relation] as RelationDefinitionFrom<
    C,
    P,
    PathsFrom<C>,
    T
  >
