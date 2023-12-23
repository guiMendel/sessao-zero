import { FirebaseApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'
import { makeHasMany, makeHasOne } from './relations'
import {
  ConstrainManyToManySettings,
  ConstrainProperties,
  ConstrainRelationSettings,
} from './types'

export type FirevaseClient<
  Properties extends ConstrainProperties = any,
  ManyToManySettings extends
    | ConstrainManyToManySettings<Properties>
    | undefined = any,
  RelationSettings extends
    | ConstrainRelationSettings<Properties, ManyToManySettings>
    | undefined = any
> = {
  /** The firestore db associated to this client */
  db: Firestore

  /** The firebase auth associated to this client */
  auth: Auth

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
  app: FirebaseApp,
  paths: Properties extends never ? never : (keyof Properties)[]
): FirevaseClient<Properties, undefined, undefined> => ({
  _tsAnchor: null as unknown as Properties,

  auth: getAuth(app),

  db: getFirestore(app),

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
