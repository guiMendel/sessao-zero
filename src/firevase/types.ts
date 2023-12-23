import { FirevaseClient } from './firevase'
import { RelationDefinition, RelationType } from './relations'

// ======================================================
// CONSTRAINTS
// ======================================================

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

// ======================================================
// ACCESSORS
// ======================================================

/** Represents some client */
export type GenericClient = FirevaseClient<
  ConstrainProperties,
  ConstrainManyToManySettings<ConstrainProperties> | undefined,
  | ConstrainRelationSettings<
      ConstrainProperties,
      ConstrainManyToManySettings<ConstrainProperties>
    >
  | undefined
>

/** Gets the resource paths from a client */
export type PathsFrom<C extends GenericClient> = keyof C['_tsAnchor']

/** Gets the resource properties from a client */
export type PropertiesFrom<C extends GenericClient> = C['_tsAnchor']

/** Gets the many to many settings from a client */
export type ManyToManyFrom<C extends GenericClient> = C['manyToManySettings']

/** Gets the relation settings from a client */
export type RelationsFrom<C extends GenericClient> = C['relationSettings']
