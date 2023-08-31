import { db } from '@/api/'
import { Resource } from '@/types'
import {
  QueryFieldFilterConstraint,
  collection,
  doc,
  onSnapshot,
  query,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { onBeforeUnmount, ref, type Ref } from 'vue'

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
  const getResourceDoc = (id: string) => doc(resourceCollection, id)

  // ========================================
  // READ & SYNC
  // ========================================

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
  const syncResource = (
    id: string,
    existingRef?: Ref<R | null>
  ): Ref<R | null> => {
    /** Reutiliza um ref sse for fornecido */
    const resource = existingRef ?? (ref<R | null>(null) as Ref<R | null>)

    // Desinscreve a ultima chamada
    unsubscribe.resource()

    // Inicia o sync
    unsubscribe.resource = onSnapshot(
      getResourceDoc(id),
      (snapshot) => (resource.value = snapshotToResource(snapshot))
    )

    return resource
  }

  /** Obtem uma lista dos recursos, filtrados */
  const syncResourceList = (
    filters: QueryFieldFilterConstraint[],
    existingRef?: Ref<R[]>
  ): Ref<R[]> => {
    /** Reutiliza um ref sse for fornecido */
    const resourceList = existingRef ?? (ref<R[]>([]) as Ref<R[]>)

    // Desabilita ultimo sync
    unsubscribe.resourceList()

    // Reinicia o sync
    unsubscribe.resourceList = onSnapshot(
      query(resourceCollection, ...filters),
      // Map de cada resource
      (snapshot) =>
        (resourceList.value = snapshot.docs.map(snapshotToResource) as R[])
    )

    return resourceList
  }

  // ==================
  // === CLEAN UP
  // ==================

  // Desinscreve tudo
  onBeforeUnmount(() => desync('all'))

  return {
    // Utilidades
    resourceCollection,
    getResourceDoc,

    // Read & Sync
    syncResource,
    syncResourceList,
    desyncResource: () => desync('resource'),
    desyncResourceList: () => desync('resourceList'),
  }
}
