import { db } from '@/api'
import { Resource, ResourcePaths, ResourceProperties } from '@/types'
import {
  DocumentSnapshot,
  QueryFieldFilterConstraint,
  QuerySnapshot,
  collection,
  doc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  query,
} from 'firebase/firestore'

export const getResourceGetter = <P extends ResourceProperties>(
  resourcePath: ResourcePaths,
  {
    snapshotToResources,
  }: {
    snapshotToResources: (
      content: DocumentSnapshot | QuerySnapshot
    ) => Resource<P>[]
  }
) => {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

  return {
    /** Pega uma instancia do recurso */
    get: (id: string) =>
      firestoreGetDoc(getDoc(id)).then((doc) => snapshotToResources(doc)[0]),

    /** Pega uma lista filtrada do recurso */
    getList: (filters: QueryFieldFilterConstraint[] = []) =>
      firestoreGetDocs(query(resourceCollection, ...filters)).then(
        snapshotToResources
      ),
  }
}
