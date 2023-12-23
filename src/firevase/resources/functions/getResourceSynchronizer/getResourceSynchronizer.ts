import { FirevaseClient } from '@/firevase'
import { SyncableRef, syncableRef } from '@/firevase/Syncable/SyncableRef'
import { PathsFrom } from '@/firevase/types'
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

export type SyncListMethod<C extends FirevaseClient, P extends PathsFrom<C>> = (
  filters?: QueryFieldFilterConstraint[],
  existingRef?: SyncableRef<C, P, Query>
) => SyncableRef<C, P, Query>

export type SyncMethod<C extends FirevaseClient, P extends PathsFrom<C>> = (
  id: string,
  existingRef?: SyncableRef<C, P, DocumentReference>
) => SyncableRef<C, P, DocumentReference>

// ====================================
// IMPLEMENTACAO
// ====================================

export const getResourceSynchronizer = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P,
  cleanupManager: CleanupManager
): { sync: SyncMethod<C, P>; syncList: SyncListMethod<C, P> } => {
  /** A collection deste recurso */
  const resourceCollection = collection(client.db, resourcePath as string)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id?: string) =>
    id != undefined ? doc(resourceCollection, id) : undefined

  /** Gera um sync em doc ou query */
  const makeSync = <M extends DocumentReference | Query>(
    target?: M,
    existingRef?: SyncableRef<C, P, M>
  ) => {
    // Se recebemos um ref, basta mudar seu target
    if (existingRef != undefined) {
      existingRef.sync.updateTarget(target)

      return existingRef
    }

    // Cria um novo syncable
    return syncableRef<C, P, M>(
      client,
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

// const syncer = getResourceSynchronizer(vase, 'guilds', new CleanupManager())

// syncer.sync('2').value.owner.ownedGuilds
