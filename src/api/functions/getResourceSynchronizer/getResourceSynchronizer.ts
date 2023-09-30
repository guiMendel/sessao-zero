import { db } from '@/api'
import { Resource, ResourceProperties } from '@/types'
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryFieldFilterConstraint,
  collection,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore'
import { ComputedRef, WritableComputedRef, computed, ref, type Ref } from 'vue'

export const desyncedReadErrorMessage =
  'Tentativa de ler um recurso dessincronizado'

export const desyncedWriteErrorMessage =
  'Tentativa de escrever em um recurso dessincronizado'

// ====================================
// TIPOS DO RETURN
// ====================================

type DesyncMethod = (target: 'resourceList' | 'resource' | 'all') => void

type SyncListMethod<P extends ResourceProperties> = (
  filters?: QueryFieldFilterConstraint[],
  existingRef?: Ref<Resource<P>[]> | undefined
) => ComputedRef<Resource<P>[]>

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
  snapshotToResource: (
    doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
  ) => Resource<P> | null
}

// ====================================
// OVERLOADS
// ====================================

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  props: GetResourceSynchronizerParams<P>
): {
  sync: (
    id: string,
    existingRef?: Ref<Resource<P> | null> | undefined
  ) => ComputedRef<Resource<P> | null>
  desync: DesyncMethod
  syncList: SyncListMethod<P>
}

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  props: GetResourceSynchronizerParams<P> & { update: UpdateMethod<P> }
): {
  sync: (
    id: string,
    existingRef?: Ref<Resource<P> | null> | undefined
  ) => WritableComputedRef<Resource<P> | null>
  desync: DesyncMethod
  syncList: SyncListMethod<P>
}

// ====================================
// IMPLEMENTACAO
// ====================================

function getResourceSynchronizer<P extends ResourceProperties>(
  resourcePath: string,
  {
    snapshotToResource,
    update,
  }: GetResourceSynchronizerParams<P> & { update?: UpdateMethod<P> }
) {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

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
  ):
    | WritableComputedRef<Resource<P> | null>
    | ComputedRef<Resource<P> | null> => {
    console.log('sync for', resourcePath, ' with id ', id)

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

    // Se nao eh writable, retorna um mais simples
    if (update == null) {
      return computed(() => {
        if (isDesynced) throw new Error(desyncedReadErrorMessage)

        return resource.value
      })
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
  ): ComputedRef<Resource<P>[]> => {
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

  return { sync, syncList, desync }
}

export { getResourceSynchronizer }
