import {
  ConstrainManyToManySettings,
  ConstrainProperties,
} from './typeConstraints'

/** Valid relation types */
export type RelationType = 'has-one' | 'has-many' | 'many-to-many'

/** Defines a relation between path S and Path T */
export type RelationDefinition<
  Properties extends ConstrainProperties,
  ManyToManySettings extends
    | ConstrainManyToManySettings<Properties>
    | undefined,
  S extends keyof Properties,
  T extends keyof Properties,
  TY extends ManyToManySettings extends undefined
    ? Omit<RelationType, 'many-to-many'>
    : RelationType = RelationType,
  R extends boolean = false
> = {
  targetResourcePath: T
  type: TY
  required: R
} & (TY extends 'many-to-many'
  ? ManyToManySettings extends undefined
    ? never
    : { manyToManyTable: keyof ManyToManySettings }
  : {
      relationKey: keyof Properties[TY extends 'has-one'
        ? S
        : TY extends 'has-many'
        ? T
        : S | T]
    })

/** Given 2 paths P and Q, returns the many-to-many tables that include both  */
export type ResourceManyToManyTables<
  Properties extends ConstrainProperties,
  ManyToManySettings extends
    | ConstrainManyToManySettings<Properties>
    | undefined,
  P extends keyof Properties,
  Q extends keyof Properties
> = ManyToManySettings extends undefined
  ? never
  : {
      [T in keyof ManyToManySettings]: ManyToManySettings[T] extends [P, Q]
        ? T
        : ManyToManySettings[T] extends [Q, P]
        ? T
        : never
    }[keyof ManyToManySettings]

/** Creates the hasMany helper for definition relations */
export const makeHasMany = <
  Properties extends ConstrainProperties,
  ManyToManySettings extends ConstrainManyToManySettings<Properties> | undefined
>() => {
  function isMany<S extends keyof Properties, T extends keyof Properties>(
    targetResourcePath: T,
    { relationKey }: { relationKey: keyof Properties[T] }
  ): RelationDefinition<Properties, ManyToManySettings, S, T, 'has-many'>

  /** Constroi uma definicao de relacao n:n */
  function isMany<S extends keyof Properties, T extends keyof Properties>(
    targetResourcePath: T,
    {
      manyToManyTable,
    }: {
      manyToManyTable: ResourceManyToManyTables<
        Properties,
        ManyToManySettings,
        S,
        T
      >
    }
  ): RelationDefinition<Properties, ManyToManySettings, S, T, 'many-to-many'>

  function isMany<S extends keyof Properties, T extends keyof Properties>(
    targetResourcePath: T,
    key:
      | {
          manyToManyTable: ResourceManyToManyTables<
            Properties,
            ManyToManySettings,
            S,
            T
          >
        }
      | { relationKey: keyof Properties[T] }
  ): RelationDefinition<
    Properties,
    ManyToManySettings,
    S,
    T,
    'many-to-many' | 'has-many'
  > {
    return 'relationKey' in key
      ? {
          relationKey: key.relationKey,
          targetResourcePath,
          type: 'has-many',
          required: false,
        }
      : {
          // @ts-ignore
          manyToManyTable: key.manyToManyTable,
          targetResourcePath,
          type: 'many-to-many',
          required: false,
        }
  }

  return isMany
}

/** Creates the hasOne helper for definition relations */
export const makeHasOne =
  <Properties extends ConstrainProperties>() =>
  <
    S extends keyof Properties,
    T extends keyof Properties,
    R extends 'required' | 'optional' = 'optional'
  >(
    targetResourcePath: T,
    { relationKey }: { relationKey: keyof Properties[S] },
    isRequired: R = 'optional' as R
  ): RelationDefinition<
    Properties,
    undefined,
    S,
    T,
    'has-one',
    R extends 'required' ? true : false
  > => ({
    required: (isRequired === 'required') as R extends 'required'
      ? true
      : false,
    relationKey,
    targetResourcePath,
    type: 'has-one',
  })
