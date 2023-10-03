import { CleanupManager, SyncableRef, db, syncableRef } from '@/api'
import { Resource, ResourceProperties } from '@/types'
import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QueryFieldFilterConstraint,
  QuerySnapshot,
  collection,
  doc,
  query,
} from 'firebase/firestore'

// ====================================
// TIPOS DO RETURN
// ====================================

type SyncListMethod<P extends ResourceProperties> = (
  filters?: QueryFieldFilterConstraint[],
  existingRef?: SyncableRef<P, Query>
) => SyncableRef<P, Query>

type SyncMethod<P extends ResourceProperties> = (
  id: string,
  existingRef?: SyncableRef<P, DocumentReference>
) => SyncableRef<P, DocumentReference>

// ====================================
// TIPOS DOS PARAMETROS
// ====================================

type UpdateMethod<P extends ResourceProperties> = (
  id: string,
  properties: Partial<P>,
  options?: {
    overwrite: boolean
  }
) => Promise<void>

type GetResourceSynchronizerParams<P extends ResourceProperties> = {
  snapshotToResources: (
    content: DocumentSnapshot | QuerySnapshot,
    previousValues: Resource<P>[]
  ) => Resource<P>[]
  cleanupManager: CleanupManager
}

// ====================================
// OVERLOADS
// ====================================

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  props: GetResourceSynchronizerParams<P>
): {
  sync: SyncMethod<P>
  syncList: SyncListMethod<P>
}

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  props: GetResourceSynchronizerParams<P> & { update: UpdateMethod<P> }
): {
  sync: SyncMethod<P>
  syncList: SyncListMethod<P>
}

// ====================================
// IMPLEMENTACAO
// ====================================

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  {
    snapshotToResources,
    // update,
    cleanupManager,
  }: GetResourceSynchronizerParams<P> & { update?: UpdateMethod<P> }
): { sync: SyncMethod<P>; syncList: SyncListMethod<P> } {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

  /** Gera um sync em doc ou query */
  const makeSync = <M extends DocumentReference | Query>(
    target: M,
    existingRef?: SyncableRef<P, M>
  ) => {
    // Se recebemos um ref, basta mudar seu target
    if (existingRef != undefined) {
      console.log({ existingRef })

      existingRef.updateTarget(target)

      return existingRef
    }

    // Cria um novo syncable
    const newRef = syncableRef<P, M>(target, snapshotToResources)

    // Adiciona ele ao cleanup to escopo atual
    cleanupManager.add(() => newRef.dispose())

    return newRef
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

export { getResourceSynchronizer }

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
