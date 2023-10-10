import { Properties, PropertyExtractor, ResourcePath } from '@/api'
import { Resource } from '@/types'
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'

/** Transforma o DocumentData em ResourceProperties */
const documentDataToResource = <
  P extends ResourcePath,
  I extends Record<string, any>
>(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
  extractProperties: PropertyExtractor<P>,
  inject?: (properties: Resource<Properties[P]>) => I
) => {
  const data = doc.data()

  if (data == undefined) return null

  const properties = {
    // Adiciona as propriedades
    ...extractProperties(doc.id, data),
    id: doc.id,
    createdAt: new Date(data.createdAt),
    modifiedAt: new Date(data.modifiedAt),
  }

  if (inject)
    return {
      ...inject(properties),
      ...properties,
    }

  return properties
}

/** Transfoma um snapshot em uma colecao de ResourceProperties */
function snapshotToResources<P extends ResourcePath>(
  content: DocumentSnapshot | QuerySnapshot,
  options: {
    extractProperties: PropertyExtractor<P>
  }
): Resource<Properties[P]>[]

/** Transfoma um snapshot em uma colecao de ResourceProperties
 * Injeta o resultado da funcao inject
 */
function snapshotToResources<
  P extends ResourcePath,
  I extends Record<string, any> = {}
>(
  content: DocumentSnapshot | QuerySnapshot,
  options: {
    extractProperties: PropertyExtractor<P>
    inject: (properties: Resource<Properties[P]>) => I
  }
): Resource<Properties[P] & I>[]

/** Extrai o recurso de um snapshot */
function snapshotToResources<
  P extends ResourcePath,
  I extends Record<string, any> = {}
>(
  content: DocumentSnapshot | QuerySnapshot,
  options: {
    extractProperties: PropertyExtractor<P>
    inject?: (properties: Resource<Properties[P]>) => I
  }
) {
  // Lida com um query
  if ('docs' in content) {
    return content.docs.map((doc) =>
      documentDataToResource(doc, options.extractProperties, options.inject)
    )
  }

  return [
    documentDataToResource(content, options.extractProperties, options.inject),
  ]
}

export { snapshotToResources }
