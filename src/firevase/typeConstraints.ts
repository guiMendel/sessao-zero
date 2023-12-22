import { RelationDefinition, RelationType } from './relations'

/** Valid data structure for properties definition */
export type ConstrainProperties = Record<string, Record<any, any>>

/** Valid data structure for definition of many to many settings */
export type ConstrainManyToManySettings<
  Properties extends ConstrainProperties
> = Record<string, [keyof Properties, keyof Properties]>

/** Valid data structure for definition of relations */
export type ConstrainRelationSettings<
  Properties extends ConstrainProperties,
  ManyToManySettings extends ConstrainManyToManySettings<Properties> | undefined
> = Partial<{
  [path in keyof Properties]: Record<
    string,
    RelationDefinition<
      Properties,
      ManyToManySettings,
      path,
      any,
      RelationType,
      boolean
    >
  >
}>
