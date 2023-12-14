import { Properties, ResourcePath } from '@/api/resources'

export type Resource<P extends ResourcePath> = Properties[P] & {
  /** Quando esta instancia foi criada */
  createdAt: Date
  /** Quando esta instancia foi modificada pela ultima vez */
  modifiedAt: Date
  /** Identificador unico desta instancia */
  id: string
  /** O caminho do resource desta instancia */
  resourcePath: P
}

export type Uploadable<P extends ResourcePath> = Properties[P] & {
  modifiedAt: string
  createdAt: string
}
