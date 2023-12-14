import { db } from '@/api/firebase'
import {
  getResourceGetter,
  getResourceSynchronizer,
} from '@/api/resources/functions'
import { Properties, ResourcePath } from '@/api/resources/resources'
import { Uploadable } from '@/api/resources/types'
import { CleanupManager } from '@/utils/classes'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { onBeforeUnmount } from 'vue'

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
  // CREATE & UPDATE
  // ========================================

  /** Remove dados sensiveis de um objeto */
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
  const create = (properties: Properties[P], useId?: string) => {
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
    properties: Partial<Properties[P]>,
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
  // DELETE
  // ========================================

  // Deleta o recurso permanentemente
  const deleteForever = async (id: string) => deleteDoc(getDoc(id))

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
