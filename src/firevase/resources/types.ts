import { Relations } from '../relations'
import { GenericClient, PathsFrom, PropertiesFrom } from '../types'

/** Has the properties and metadata of a resource */
export type HalfResource<
  C extends GenericClient,
  P extends PathsFrom<C>
> = PropertiesFrom<C>[P] & {
  /** Quando esta instancia foi criada */
  createdAt: Date
  /** Quando esta instancia foi modificada pela ultima vez */
  modifiedAt: Date
  /** Identificador unico desta instancia */
  id: string
  /** O caminho do resource desta instancia */
  resourcePath: P
}

/** Has the properties, metadata and relations of a resource */
export type Resource<
  C extends GenericClient,
  P extends PathsFrom<C>
> = HalfResource<C, P> & Relations<C, P>

// declare const test: Resource<Vase, 'guilds'>
// test.owner.ownedGuilds

/** How a resource's data is stored on firestore */
export type Uploadable<
  C extends GenericClient,
  P extends PathsFrom<C>
> = PropertiesFrom<C>[P] & {
  modifiedAt: string
  createdAt: string
}
