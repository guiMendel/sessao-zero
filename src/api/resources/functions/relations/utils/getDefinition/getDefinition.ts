import {
  RelationDefinition,
  RelationType,
  ResourcePath,
  UnrefedResourceRelations,
  relationSettings,
} from '@/api/resources'

export const getDefinition = <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>,
  T extends RelationType
>(
  path: P,
  relation: R,
  _: T
) => relationSettings[path][relation] as RelationDefinition<P, ResourcePath, T>
