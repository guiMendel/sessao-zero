import { makeHasMany, makeHasOne } from './relations'
import {
  ConstrainManyToManySettings,
  ConstrainProperties,
  ConstrainRelationSettings,
} from './typeConstraints'

type FirevaseClient<
  Properties extends ConstrainProperties,
  ManyToManySettings extends
    | ConstrainManyToManySettings<Properties>
    | undefined = undefined,
  RelationSettings extends
    | ConstrainRelationSettings<Properties, ManyToManySettings>
    | undefined = undefined
> = {
  /** The resource paths to be managed by firevase */
  paths: (keyof Properties)[]

  /** The many to many tables mapped to which paths they are comprised of */
  manyToManySettings: ManyToManySettings

  /** The settings of the relations between all the paths */
  relationSettings: RelationSettings

  /** Returns a new firevase client configured with the provided many to many settings */
  configureManyToMany: <
    NewSettings extends ConstrainManyToManySettings<Properties>
  >(
    newSettings: NewSettings
    // @ts-ignore
  ) => FirevaseClient<Properties, NewSettings, RelationSettings>

  /** Allows extending this firevase definition with relation capabilities */
  configureRelations: <
    NewSettings extends ConstrainRelationSettings<
      Properties,
      ManyToManySettings
    >
  >(
    definer: (defineRelation: {
      hasOne: ReturnType<typeof makeHasOne<Properties>>
      hasMany: ReturnType<typeof makeHasMany<Properties, ManyToManySettings>>
    }) => NewSettings
  ) => FirevaseClient<Properties, ManyToManySettings, NewSettings>

  /** An anchor only used to keep track of the provided ts types
   * @private
   */
  _tsAnchor: Properties
}

/** Declares the paths of the firestore resources you want firevase to manage */
export const fillFirevase = <
  RequireProperties extends Record<string, Record<any, any>> = never,
  Properties extends RequireProperties = RequireProperties
>(
  paths: Properties extends never ? never : (keyof Properties)[]
): FirevaseClient<Properties> => ({
  _tsAnchor: null as unknown as Properties,

  paths,

  manyToManySettings: undefined,

  relationSettings: undefined,

  // @ts-ignore
  configureManyToMany(manyToManySettings) {
    return {
      ...this,
      manyToManySettings,
    }
  },

  // @ts-ignore
  configureRelations(definer) {
    return {
      ...this,
      relationSettings: definer({
        hasMany: makeHasMany(),
        hasOne: makeHasOne(),
      }),
    }
  },
})
