import { db } from '@/api/firebase'
import { FullInstance, ResourcePath } from '@/api/resources/resources'
import { CleanupManager } from '@/utils/classes'
import {
  QueryFieldFilterConstraint,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
} from 'firebase/firestore'
import { makeFullInstance } from '../makeFullInstance'

// ====================================
// TIPOS DO RETURN
// ====================================

export type GetListMethod<P extends ResourcePath> = (
  filters?: QueryFieldFilterConstraint[]
) => Promise<FullInstance<P>[]>

export type GetMethod<P extends ResourcePath> = (
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

  return {
    /** Pega uma instancia do recurso */
    get: (id: string) =>
      getDoc(doc(resourceCollection, id)).then(
        (doc) => makeFullInstance(doc, resourcePath, cleanupManager, [])[0]
      ),

    /** Pega uma lista filtrada do recurso */
    getList: (filters: QueryFieldFilterConstraint[] = []) =>
      getDocs(query(resourceCollection, ...filters)).then(
        (docs) =>
          makeFullInstance(
            docs,
            resourcePath,
            cleanupManager,
            []
          ) as FullInstance<P>[]
      ),
  }
}
