import { db } from '@/api/firebase'
import {
  getResourceGetter,
  getResourceSynchronizer,
} from '@/api/resources/functions'
import { Properties, ResourcePath } from '@/api/resources/resources'
import { CleanupManager } from '@/utils/classes'
import { collection, doc } from 'firebase/firestore'
import { onBeforeUnmount } from 'vue'
import {
  createResource,
  deleteResource,
  updateResource,
} from '../../functions/write'

/** Fornece uma interface para ler e escrever dados de um recurso no firestore, com sync.
 * @param resourcePath O caminho do recurso no firestore
 */
export const useResource = <P extends ResourcePath>(resourcePath: P) => {
  // ========================================
  // UTILIDADES
  // ========================================

  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Gerenciador de cleanups desta instancia */
  const cleanupManager = new CleanupManager()

  /** Obtem a referencia de documento para o id fornecido */
  const getDoc = (id: string) => doc(resourceCollection, id)

  // ========================================
  // WRITE
  // ========================================

  /** Cria um novo recurso */
  const create = (properties: Properties[P], useId?: string) =>
    createResource(resourcePath, properties, useId)

  /** Cria um novo recurso */
  const update = (
    id: string,
    properties: Partial<Properties[P]>,
    options = { overwrite: false }
  ) => updateResource(resourcePath, id, properties, options)

  /** Destroi o recurso permanentemente */
  const deleteForever = (id: string) => deleteResource(resourcePath, id)

  // ========================================
  // READ
  // ========================================

  /** Pega os getters */
  const { get, getList } = getResourceGetter(resourcePath, cleanupManager)

  // ========================================
  // SYNC
  // ========================================

  /** Pega os metodos de sync */
  const { sync, syncList } = getResourceSynchronizer(
    resourcePath,
    cleanupManager
  )

  // ========================================
  // CLEAN UP
  // ========================================

  // Desinscreve tudo
  onBeforeUnmount(() => cleanupManager.dispose())

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

    // Delete
    deleteForever,
  }
}
