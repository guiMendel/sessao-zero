import {
  CleanupManager,
  RelationBuilder,
  buildRelations,
  db,
  getResourceGetter,
  getResourceSynchronizer,
  snapshotToResources as originalSnapshotToResources,
} from '@/api/'
import { ResourcePath } from '@/api/constants/resources'
import { Resource, ResourceProperties, Uploadable } from '@/types'
import {
  QuerySnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { onBeforeUnmount } from 'vue'

const defaultOptions = {
  propertiesExtractor: <T>(_: string, documentData: DocumentData): T =>
    ({
      ...documentData,
    } as T),
  relations: {},
}

/** Fornece uma interface para ler e escrever dados de um recurso no firestore, com sync.
 * P para Properties, R para Relations
 * @param resourcePath O caminho do recurso no firestore
 * @param extractProperties Um metodo para extrair os dados do recurso dos dados de um documento do firestore
 */
export const useResourceAPI = <
  P extends ResourcePath,
  R extends Record<string, RelationBuilder<P, ResourceProperties>> = {}
>(
  resourcePath: P,
  options?: {
    relations?: R
  }
) => {
  const extractProperties = (options?.propertiesExtractor ??
    propertyExtractors[resourcePath] ??
    defaultOptions.propertiesExtractor) as PropertyExtractor<P>

  const relationBuilders = options?.relations ?? (defaultOptions.relations as R)

  type InjectedRelations = {
    [relation in keyof R]: ReturnType<R[relation]['build']>
  }

  type PWithRelations = P & InjectedRelations

  // ========================================
  // UTILIDADES
  // ========================================

  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  /** Gerenciador de cleanups desta instancia */
  const cleanupManager = new CleanupManager()

  /** Extrai o recurso de um snapshot */
  const snapshotToResources = (
    content: DocumentSnapshot | QuerySnapshot,
    previousValues: Resource<PWithRelations>[] = []
  ): Resource<PWithRelations>[] => {
    const previousValuesMap = previousValues.reduce(
      (map, properties) => ({ ...map, [properties.id]: properties }),
      {} as Record<string, PWithRelations>
    )

    const resources = originalSnapshotToResources<P, InjectedRelations>(
      content,
      {
        extractProperties,
        inject: (resource) =>
          buildRelations<P>(
            properties,
            id,
            relationBuilders,
            previousValuesMap,
            cleanupManager
          ),
      }
    )

    // TODO: chamar dispose em todos os recursos de previouValues que nao foram reutilizados

    return resources
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

  /** Pega os getters */
  const { get, getList } = getResourceGetter(resourcePath, {
    snapshotToResources,
  })

  // ========================================
  // SYNC
  // ========================================

  /** Pega os metodos de sync */
  const { sync, syncList } = getResourceSynchronizer(resourcePath, {
    snapshotToResources,
    update,
    cleanupManager,
  })

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
    snapshotToResources,
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
