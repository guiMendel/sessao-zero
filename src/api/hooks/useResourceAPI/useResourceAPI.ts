import { db } from '@/api/'
import { PartialUploadable, Resource, Uploadable } from '@/types'
import {
  QueryFieldFilterConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  ComputedRef,
  WritableComputedRef,
  computed,
  onBeforeUnmount,
  ref,
  type Ref
} from 'vue'

export const desyncedReadErrorMessage =
  'Tentativa de ler um recurso dessincronizado'

export const desyncedWriteErrorMessage =
  'Tentativa de escrever em um recurso dessincronizado'

/** Fornece uma interface para ler e escrever dados de um recurso no firestore, com sync
 * @param resourceName O nome do recurso a ser acessado (deve corresponder a um nome de recurso root no firestore)
 * @param extractResource Um metodo para extrair os dados do recurso dos dados de um documento do firestore
 */
export const useResourceAPI = <R extends Resource>(
  resourceName: string,
  extractResource: (resourceUid: string, resourceData: DocumentData) => R
) => {
  // ========================================
  // UTILIDADES
  // ========================================

  /** A collection deste recurso */
  const resourceCollection = collection(db, resourceName)

  /** Extrai o recurso de um snapshot */
  const snapshotToResource = (
    doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
  ): R | null => {
    const resourceData = doc.data()

    if (resourceData == undefined) return null

    return extractResource(doc.id, resourceData)
  }

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

  // ========================================
  // CREATE & UPDATE
  // ========================================

  /** Remove dados sensiveis de um objecto */
  const secureData = (
    data: Record<string, any>,
    ...removeFields: string[]
  ): Omit<typeof data, 'createdAt' | 'modifiedAt' | 'password' | 'senha'> => {
    const secureData = JSON.parse(JSON.stringify(data)) as Record<string, any>

    for (const field of [
      ...removeFields,
      'createdAt',
      'modifiedAt',
      'password',
      'senha',
    ])
      delete secureData[field]

    return secureData
  }

  /** Cria um novo recurso */
  const create = (
    properties: Omit<Uploadable<R>, 'createdAt' | 'modifiedAt'>
  ) => {
    const securedData = {
      ...secureData(properties, 'id'),
      createdAt: new Date().toJSON(),
      modifiedAt: new Date().toJSON(),
    } as Uploadable<R>

    return addDoc(resourceCollection, securedData)
  }

  /** Cria um novo recurso */
  const update = (
    id: string,
    properties: Omit<PartialUploadable<R>, 'createdAt' | 'modifiedAt'>
  ) => {
    const securedData = {
      ...secureData(properties, 'id'),
      modifiedAt: new Date().toJSON(),
    } as PartialUploadable<R>

    return updateDoc(getDoc(id), securedData)
  }

  // ========================================
  // READ & SYNC
  // ========================================

  /** Guarda as referencias syncadas */
  const synced = {
    resourceList: null as null | Ref<R[]>,
    resource: null as null | Ref<R | null>,
  }

  /** Metodos para desinscrever syncs */
  const unsubscribe = {
    /** Desinscreve o sync da lista dos recursos */
    resourceList: () => {},
    /** Desinscreve o sync de um recurso especifico */
    resource: () => {},
  }

  /** Desinscreve um sync de recurso ou de lista de recursos */
  const desync = (target: keyof typeof unsubscribe | 'all') => {
    if (target === 'all') {
      desync('resource')
      desync('resourceList')
      return
    }

    unsubscribe[target]()
    unsubscribe[target] = () => {}
  }

  /** Obtem um recurso a partir de seu id
   * @param id O id do recurso alvo
   * @param existingRef Um ref para utilizar na sincronizacao
   */
  const sync = (
    id: string,
    existingRef?: Ref<R | null>
  ): WritableComputedRef<R | null> => {
    // Desinscreve a ultima chamada
    unsubscribe.resource()

    /** Reutiliza um ref sse for fornecido */
    const resource = existingRef ?? (ref<R | null>(null) as Ref<R | null>)

    // Guarda esse ref
    synced.resource = resource

    /** Informa se esta chamada foi dessincronizada */
    let isDesynced = false

    // Inicia o sync
    const unsubscribeFirestore = onSnapshot(
      getDoc(id),
      (snapshot) => (resource.value = snapshotToResource(snapshot))
    )

    unsubscribe.resource = () => {
      isDesynced = true
      unsubscribeFirestore()
      if (synced.resource) {
        synced.resource.value = null
        synced.resource = null
      }
    }

    return computed({
      get: () => {
        if (isDesynced) throw new Error(desyncedReadErrorMessage)

        return resource.value
      },

      set: (newValue) => {
        // Erro se estiver desynced
        if (isDesynced) throw new Error(desyncedWriteErrorMessage)

        // Ignora se for nulo
        if (resource.value == null) return

        // Desync se receber null
        if (newValue == null) {
          desync('resource')
          return
        }

        // Atualiza os dados
        update(
          id,
          newValue as unknown as Omit<
            PartialUploadable<R>,
            'modifiedAt' | 'createdAt'
          >
        )
      },
    })
  }

  /** Obtem uma lista dos recursos, filtrados */
  const syncList = (
    filters: QueryFieldFilterConstraint[] = [],
    existingRef?: Ref<R[]>
  ): ComputedRef<R[]> => {
    // Desabilita ultimo sync
    unsubscribe.resourceList()

    /** Reutiliza um ref sse for fornecido */
    const resourceList = existingRef ?? (ref<R[]>([]) as Ref<R[]>)

    // Guarda o ref
    synced.resourceList = resourceList

    /** Informa se esta chamada foi dessincronizada */
    let isDesynced = false

    // Reinicia o sync
    const unsubscribeFirestore = onSnapshot(
      query(resourceCollection, ...filters),
      // Map de cada resource
      (snapshot) =>
        (resourceList.value = snapshot.docs.map(snapshotToResource) as R[])
    )

    unsubscribe.resourceList = () => {
      isDesynced = true
      unsubscribeFirestore()
      if (synced.resourceList) {
        synced.resourceList.value = []
        synced.resourceList = null
      }
    }

    return computed(() => {
      if (isDesynced) throw new Error(desyncedReadErrorMessage)

      return resourceList.value
    })
  }

  // ==================
  // === DELETE
  // ==================

  // Deleta o recurso permanentemente
  const deleteForever = async (id: string) => deleteDoc(getDoc(id))

  // ==================
  // === CLEAN UP
  // ==================

  // Desinscreve tudo
  onBeforeUnmount(() => desync('all'))

  return {
    // Utilidades
    resourceCollection,
    getDoc,

    // Create & Update
    create,
    update,

    // Read & Sync
    sync,
    syncList,
    desync: () => desync('resource'),
    desyncList: () => desync('resourceList'),

    // Delete
    deleteForever,
  }
}
