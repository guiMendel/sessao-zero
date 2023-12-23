import { SyncableRef, syncableRef } from '@/firevase/Syncable/SyncableRef'
import { db } from '@/api/firebase'
import { ResourcePath } from '@/firevase/resources'
import { CleanupManager } from '@/utils/classes'
import {
  DocumentReference,
  Query,
  QueryFieldFilterConstraint,
  collection,
  doc,
  query,
} from 'firebase/firestore'

// ====================================
// TIPOS DO RETURN
// ====================================

export type SyncListMethod<P extends ResourcePath> = (
  filters?: QueryFieldFilterConstraint[],
  existingRef?: SyncableRef<P, Query>
) => SyncableRef<P, Query>

export type SyncMethod<P extends ResourcePath> = (
  id: string,
  existingRef?: SyncableRef<P, DocumentReference>
) => SyncableRef<P, DocumentReference>

// ====================================
// IMPLEMENTACAO
// ====================================

export const getResourceSynchronizer = <P extends ResourcePath>(
  resourcePath: P,
  cleanupManager: CleanupManager
): { sync: SyncMethod<P>; syncList: SyncListMethod<P> } => {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id?: string) =>
    id != undefined ? doc(resourceCollection, id) : undefined

  /** Gera um sync em doc ou query */
  const makeSync = <M extends DocumentReference | Query>(
    target?: M,
    existingRef?: SyncableRef<P, M>
  ) => {
    // Se recebemos um ref, basta mudar seu target
    if (existingRef != undefined) {
      existingRef.sync.updateTarget(target)

      return existingRef
    }

    // Cria um novo syncable
    return syncableRef<P, M>(
      resourcePath,
      target ?? 'empty-document',
      cleanupManager
    )
  }

  return {
    /** Obtem um recurso a partir de seu id
     * @param id O id do recurso alvo
     * @param existingRef Um ref para utilizar na sincronizacao
     */
    sync: (id, existingRef) => makeSync(getDoc(id), existingRef),

    /** Obtem uma lista dos recursos, filtrados */
    syncList: (filters = [], existingRef) =>
      makeSync(query(resourceCollection, ...filters), existingRef),
  }
}
