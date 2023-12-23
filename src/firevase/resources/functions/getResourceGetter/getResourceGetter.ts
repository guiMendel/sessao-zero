import { db } from '@/api/firebase'
import { FullInstance, ResourcePath } from '@/firevase/resources/resources'
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
import { Resource, makeResource } from '../..'

// ====================================
// TIPOS DO RETURN
// ====================================

export type GetListMethod<L extends FullInstance<any> | Resource<any>> = (
  filters?: QueryFieldFilterConstraint[]
) => Promise<L[]>

export type GetMethod<L extends FullInstance<any> | Resource<any>> = (
  id: string
) => Promise<L | undefined>

// ====================================
// IMPLEMENTACAO
// ====================================

/** Permite acesso a um recurso, sem injetar relacoes */
export function getResourceGetter<P extends ResourcePath>(
  resourcePath: P
): { get: GetMethod<Resource<P>>; getList: GetListMethod<Resource<P>> }

/** Permite acesso a um recurso e injeta relacoes */
export function getResourceGetter<P extends ResourcePath>(
  resourcePath: P,
  cleanupManager: CleanupManager
): { get: GetMethod<FullInstance<P>>; getList: GetListMethod<FullInstance<P>> }

export function getResourceGetter<P extends ResourcePath>(
  resourcePath: P,
  cleanupManager?: CleanupManager
): {
  get: GetMethod<Resource<P> | FullInstance<P>>
  getList: GetListMethod<Resource<P> | FullInstance<P>>
} {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  return {
    /** Pega uma instancia do recurso */
    get: (id: string) =>
      getDoc(doc(resourceCollection, id)).then((doc) =>
        cleanupManager != undefined
          ? makeFullInstance(doc, resourcePath, cleanupManager, [])[0]
          : makeResource(doc, resourcePath)[0]
      ),

    /** Pega uma lista filtrada do recurso */
    getList: (filters: QueryFieldFilterConstraint[] = []) =>
      getDocs(query(resourceCollection, ...filters)).then((docs) =>
        cleanupManager != undefined
          ? (makeFullInstance(
              docs,
              resourcePath,
              cleanupManager,
              []
            ) as FullInstance<P>[])
          : (makeResource(docs, resourcePath) as Resource<P>[])
      ),
  }
}
