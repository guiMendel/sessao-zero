import { ResourcePath, SyncableRef, db, syncableRef } from '@/api'
import { CleanupManager } from '@/utils'
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
// TIPOS DOS PARAMETROS
// ====================================

// type UpdateMethod<P extends ResourcePath> = (
//   id: string,
//   properties: Partial<Properties[P]>,
//   options?: {
//     overwrite: boolean
//   }
// ) => Promise<void>

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

/** O setter do sync */
// const set = (newValue: P | null) => {
//   // Erro se estiver desynced
//   if (isDesynced) throw new Error(desyncedWriteErrorMessage)

//   // Ignora se for nulo
//   if (resource.value == null) return

//   // Desync se receber null
//   if (newValue == null) {
//     desync('resource')
//     return
//   }

//   // Atualiza os dados
//   update(id, newValue)
// }

// return computed({
//   // O get retorna um proxy para permitir escrever o valor das propriedades diretamente
//   get: () => {
//     if (isDesynced) throw new Error(desyncedReadErrorMessage)

//     if (resource.value == null) return resource.value

//     return new Proxy(resource.value, {
//       set: (resource, property, newValue) => {
//         resource[property as keyof P] = newValue
//         set(resource)

//         return true
//       },
//     })
//   },

//   set,
// })
