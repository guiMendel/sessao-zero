import { FirevaseClient, Vase } from '../firevase'
import { Relations } from '../relations'
import { PathsFrom, PropertiesFrom } from '../types'

/** Has the properties and metadata of a resource */
export type HalfResource<C extends FirevaseClient, P extends PathsFrom<C>> = {
  /** Quando esta instancia foi criada */
  createdAt: Date
  /** Quando esta instancia foi modificada pela ultima vez */
  modifiedAt: Date
  /** Identificador unico desta instancia */
  id: string
  /** O caminho do resource desta instancia */
  resourcePath: P
} & PropertiesFrom<C>[P]

/** Has the properties, metadata and relations of a resource */
export type Resource<
  C extends FirevaseClient,
  P extends PathsFrom<C>
> = HalfResource<C, P> & Relations<C, P>

// declare const test: HalfResource<Vase, 'guilds'>
// test.

/** How a resource's data is stored on firestore */
export type Uploadable<
  C extends FirevaseClient,
  P extends PathsFrom<C>
> = PropertiesFrom<C>[P] & {
  modifiedAt: string
  createdAt: string
}
