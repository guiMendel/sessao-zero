import {
  CleanupManager,
  FullInstance,
  ResourcePath,
  db,
  getFullInstance
} from '@/api'
import {
  QueryFieldFilterConstraint,
  collection,
  doc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  query,
} from 'firebase/firestore'

// ====================================
// TIPOS DO RETURN
// ====================================

type GetListMethod<P extends ResourcePath> = (
  filters?: QueryFieldFilterConstraint[]
) => Promise<FullInstance<P>[]>

type GetMethod<P extends ResourcePath> = (
  id: string
) => Promise<FullInstance<P> | undefined>

// ====================================
// IMPLEMENTACAO
// ====================================

/** Permite acesso a um recurso */
export const getResourceGetter = <P extends ResourcePath>(
  resourcePath: P,
  cleanupManager: CleanupManager
): { get: GetMethod<P>; getList: GetListMethod<P> } => {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

  return {
    /** Pega uma instancia do recurso */
    get: (id: string) =>
      firestoreGetDoc(getDoc(id)).then(
        (doc) => getFullInstance(doc, resourcePath, cleanupManager, [])[0]
      ),

    /** Pega uma lista filtrada do recurso */
    getList: (filters: QueryFieldFilterConstraint[] = []) =>
      firestoreGetDocs(query(resourceCollection, ...filters)).then(
        (docs) =>
          getFullInstance(
            docs,
            resourcePath,
            cleanupManager,
            []
          ) as FullInstance<P>[]
      ),
  }
}
