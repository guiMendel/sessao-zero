import { RelationBuilder, buildRelations, db } from '@/api/'
import { Resource, Uploadable } from '@/types'
import {
  QueryFieldFilterConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  onSnapshot,
  query,
  setDoc,
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
  type Ref,
} from 'vue'

export const desyncedReadErrorMessage =
  'Tentativa de ler um recurso dessincronizado'

export const desyncedWriteErrorMessage =
  'Tentativa de escrever em um recurso dessincronizado'

const defaultOptions = {
  propertiesExtractor: <T>(_: string, documentData: DocumentData): T =>
    ({
      ...documentData,
    } as T),
  relations: {},
}

/** Fornece uma interface para ler e escrever dados de um recurso no firestore, com sync
 * @param resourceName O nome do recurso a ser acessado (deve corresponder a um nome de recurso root no firestore)
 * @param extractProperties Um metodo para extrair os dados do recurso dos dados de um documento do firestore
 */
export const useResourceAPI = <
  P extends Record<string, any>,
  R extends Record<string, RelationBuilder<P, unknown>>
>(
  resourceName: string,
  options?: {
    propertiesExtractor?: (id: string, documentData: DocumentData) => P
    relations?: R
  }
) => {
  const extractProperties =
    options?.propertiesExtractor ?? defaultOptions.propertiesExtractor

  const relationBuilders = options?.relations ?? defaultOptions.relations

  type PWithRelations = P & {
    [relation in keyof R]: ReturnType<R[relation]['build']>
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /** A collection deste recurso */
  const resourceCollection = collection(db, resourceName)

  /** Extrai o recurso de um snapshot */
  const snapshotToResource = (
    doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
  ): Resource<PWithRelations> | null => {
    const documentData = doc.data()

    if (documentData == undefined) return null

    return {
      // Adiciona as propriedades
      ...extractProperties(doc.id, documentData),
      // Adiciona as relacoes
      ...buildRelations(relationBuilders),
      id: doc.id,
      createdAt: new Date(documentData.createdAt),
      modifiedAt: new Date(documentData.modifiedAt),
    }
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
  const create = (properties: P, useId?: string) => {
    const securedData = {
      ...secureData(properties, 'id'),
      createdAt: new Date().toJSON(),
      modifiedAt: new Date().toJSON(),
    } as Uploadable<P>

    if (useId != undefined) return setDoc(getDoc(useId), securedData)

    return addDoc(resourceCollection, securedData)
  }

  /** Cria um novo recurso */
  const update = (
    id: string,
    properties: Partial<P>,
    { overwrite } = { overwrite: false }
  ) => {
    const securedData = {
      ...secureData(properties, 'id'),
      modifiedAt: new Date().toJSON(),
    }

    if (overwrite) setDoc(getDoc(id), secureData)

    return updateDoc(getDoc(id), securedData)
  }

  // ========================================
  // READ
  // ========================================

  /** Pega uma instancia do recurso */
  const get = (id: string) =>
    firestoreGetDoc(getDoc(id)).then(snapshotToResource)

  /** Pega uma lsita filtrada do recurso */
  const getList = (filters: QueryFieldFilterConstraint[] = []) =>
    firestoreGetDocs(query(resourceCollection, ...filters)).then(
      (snapshot) => snapshot.docs.map(snapshotToResource) as Resource<P>[]
    )

  // ========================================
  // SYNC
  // ========================================

  /** Guarda as referencias syncadas */
  const synced = {
    resourceList: null as null | Ref<Resource<P>[]>,
    resource: null as null | Ref<Resource<P> | null>,
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
    existingRef?: Ref<Resource<P> | null>
  ): WritableComputedRef<Resource<PWithRelations> | null> => {
    // Desinscreve a ultima chamada
    unsubscribe.resource()

    /** Reutiliza um ref sse for fornecido */
    const resource =
      existingRef ?? (ref<Resource<P> | null>(null) as Ref<Resource<P> | null>)

    // Guarda esse ref
    synced.resource = resource

    /** Informa se esta chamada foi dessincronizada */
    let isDesynced = false

    // Inicia o sync
    const unsubscribeFirestore = onSnapshot(
      getDoc(id),
      (snapshot) => (resource.value = snapshotToResource(snapshot))
    )

    // Armazena um metodo para desinscrever
    unsubscribe.resource = () => {
      isDesynced = true
      unsubscribeFirestore()
      if (synced.resource) {
        synced.resource.value = null
        synced.resource = null
      }
    }

    /** O setter do sync */
    const set = (newValue: P | null) => {
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
      update(id, newValue)
    }

    return computed({
      // O get retorna um proxy para permitir escrever o valor das propriedades diretamente
      get: () => {
        if (isDesynced) throw new Error(desyncedReadErrorMessage)

        if (resource.value == null) return resource.value

        return new Proxy(resource.value, {
          set: (resource, property, newValue) => {
            resource[property as keyof P] = newValue
            set(resource)

            return true
          },
        })
      },

      set,
    })
  }

  /** Obtem uma lista dos recursos, filtrados */
  const syncList = (
    filters: QueryFieldFilterConstraint[] = [],
    existingRef?: Ref<Resource<P>[]>
  ): ComputedRef<Resource<PWithRelations>[]> => {
    // Desabilita ultimo sync
    unsubscribe.resourceList()

    /** Reutiliza um ref sse for fornecido */
    const resourceList =
      existingRef ?? (ref<Resource<P>[]>([]) as Ref<Resource<P>[]>)

    // Guarda o ref
    synced.resourceList = resourceList

    /** Informa se esta chamada foi dessincronizada */
    let isDesynced = false

    // Reinicia o sync
    const unsubscribeFirestore = onSnapshot(
      query(resourceCollection, ...filters),
      // Map de cada resource
      (snapshot) =>
        (resourceList.value = snapshot.docs.map(
          snapshotToResource
        ) as Resource<P>[])
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
    get,
    getList,
    sync,
    syncList,
    desync: () => desync('resource'),
    desyncList: () => desync('resourceList'),

    // Delete
    deleteForever,
  }
}
