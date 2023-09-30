import {
  CleanupManager,
  RelationBuilder,
  buildRelations,
  db,
  getResourceSynchronizer,
  snapshotToResource as originalSnapshotToResource,
} from '@/api/'
import { Resource, ResourceProperties, Uploadable } from '@/types'
import {
  QueryFieldFilterConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
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
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
>(
  resourcePath: string,
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
  const resourceCollection = collection(db, resourcePath)

  /** Gerenciador de cleanups desta instancia */
  const cleanupManger = new CleanupManager()

  /** Extrai o recurso de um snapshot */
  const snapshotToResource = (
    doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
  ): Resource<PWithRelations> | null =>
    originalSnapshotToResource(doc, {
      extractProperties,
      inject: (properties: P) =>
        buildRelations<P, R>(properties, relationBuilders, cleanupManger),
    })

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

  /** Pega os metodos de sync */
  const { desync, sync, syncList } = getResourceSynchronizer(resourcePath, {
    snapshotToResource,
    update,
  })

  // ========================================
  // DELETE
  // ========================================

  // Deleta o recurso permanentemente
  const deleteForever = async (id: string) => deleteDoc(getDoc(id))

  // ========================================
  // CLEAN UP
  // ========================================

  cleanupManger.add(() => desync('all'))

  // Desinscreve tudo
  onBeforeUnmount(() => cleanupManger.cleanup())

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
