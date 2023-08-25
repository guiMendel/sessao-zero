import { db } from '@/api/'
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

// Allows for syncing to resources in firestore
export const useResourceAPI = <Resource>(
  resourceCollection: string,
  extractResource: (resourceUid: string, resourceData: DocumentData) => Resource
) => {
  const resourceCollectionInstance = collection(db, resourceCollection)

  // Unsubscribe callbacks
  const unsubscribe = {
    resources: () => {},
    resource: () => {},
  }

  // Extract a resource from a db resource doc
  const snapshotToResource = (
    doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
  ): Resource | null => {
    const resourceData = doc.data()

    if (resourceData == undefined) return null

    return extractResource(doc.id, resourceData)
  }

  // Get reference to a resource's doc
  const getResourceDocRef = (uid: string) =>
    doc(resourceCollectionInstance, uid)

  // Unsubscribe last synced resource
  const desyncResource = () => {
    unsubscribe.resource()
    unsubscribe.resource = () => {}
  }

  // Get a resource
  const syncResource = (
    uid: string,
    existingRef?: Ref<Resource | null>
  ): Ref<Resource | null> => {
    // Reuse resource if provided
    const resource =
      existingRef ?? (ref<Resource | null>(null) as Ref<Resource | null>)

    // Disable last call
    unsubscribe.resource()

    // Listen for changes to resource
    unsubscribe.resource = onSnapshot(
      getResourceDocRef(uid),
      (snapshot) => (resource.value = snapshotToResource(snapshot))
    )

    return resource
  }

  /** A list de recursos sincronizada, filtrada por listQueryFilters  */
  const syncedResourceList = ref<Resource[]>([]) as Ref<Resource[]>

  /** Filtra syncedResourceList com as clausulas fornecidas. Nao so retorna a lsita filtrada, mas tambem
   * passa a filtrar syncedResourceList igualmente
   * @param filters os filtros a serem aplicados
   * @returns Uma promessa que resolve quando syncedResourceList eh atualizado, com os valores filtrados
   */
  const filterResourceList = async (
    ...filters: QueryFieldFilterConstraint[]
  ): Promise<Resource[]> =>
    new Promise((resolve) => {
      // Desabilita ultimo sync
      unsubscribe.resources()

      // Reinicia o sync
      unsubscribe.resources = onSnapshot(
        query(resourceCollectionInstance, ...filters),
        // Map de cada resource
        (snapshot) =>
          // Resolve a promessa na primeira chamada
          resolve(
            (syncedResourceList.value = snapshot.docs.map(
              snapshotToResource
            ) as Resource[])
          )
      )
    })

  // Inicializa sem filtros
  filterResourceList()

  // ==================
  // === CLEAN UP
  // ==================

  // Perform unsubscriptions
  onBeforeUnmount(() => {
    unsubscribe.resources()
    unsubscribe.resource()
  })

  return {
    syncResource,
    syncedResourceList,
    filterResourceList,
    desyncResource,
    getResourceDocRef,
    resourceCollection: resourceCollectionInstance,
  }
}
