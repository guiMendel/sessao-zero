import { ResourcePath, getPropertyExtrator } from '@/api/resources/resources'
import { Resource } from '@/api/resources/types'
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'

/** Gera um (ou varios) Resources dos dados recebidos como documento ou query
 * @param snapshot Possui dados para popular as propriedades da nova instancia
 */
export const makeResource = <P extends ResourcePath>(
  snapshot: DocumentSnapshot | QuerySnapshot,
  resourcePath: P
): Array<Resource<P> | undefined> => {
  // Lida com um query
  if ('docs' in snapshot) {
    return snapshot.docs.map((doc) => documentToResource(doc, resourcePath))
  }

  return [documentToResource(snapshot, resourcePath)]
}

/** Gera um recurso a partir de um documento */
const documentToResource = <P extends ResourcePath>(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
  resourcePath: P
): Resource<P> | undefined => {
  const data = doc.data()

  if (data == undefined) return undefined

  /** Obtem o extractor desse path */
  const extractProperties = getPropertyExtrator(resourcePath)

  return {
    // Adiciona as propriedades
    ...extractProperties(doc.id, data),
    id: doc.id,
    createdAt: new Date(data.createdAt),
    modifiedAt: new Date(data.modifiedAt),
    resourcePath,
  }
}