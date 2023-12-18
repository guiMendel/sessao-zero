import { db } from '@/api/firebase'
import {
  FullInstance,
  RelationDefinition,
  RelationSettings,
  Resource,
  ResourcePath,
  UnrefedRelations,
  getResourceGetter,
  relationSettings,
} from '@/api/resources'
import { CleanupManager } from '@/utils/classes'
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

/** Retorna a(s) instancia(s) associada a relacao de um recurso, como full instance */
export function getRelation<
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  relation: R,
  cleanupManager: CleanupManager
): Promise<
  // @ts-ignore
  undefined | FullInstance<RelationSettings<P>[R]['targetResourcePath']>
>

/** Retorna a(s) instancia(s) associada a relacao de um recurso */
export function getRelation<
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  relation: R
): Promise<
  // @ts-ignore
  undefined | Resource<RelationSettings<P>[R]['targetResourcePath']>
>

export function getRelation<
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(source: Resource<P>, relation: R, cleanupManager?: CleanupManager) {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath>

  switch (definition.type) {
    case 'has-one':
      return getHasOneRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-one'>,
        cleanupManager
      )

    case 'has-many':
      return getHasManyRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-many'>,
        cleanupManager
      )

    case 'many-to-many':
      return getManyToManyRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'many-to-many'>,
        cleanupManager
      )

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

const getHasOneRelation = <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-one'>,
  cleanupManager?: CleanupManager
) => {
  const { get } = cleanupManager
    ? getResourceGetter(definition.targetResourcePath, cleanupManager)
    : getResourceGetter(definition.targetResourcePath)

  const targetId = source[definition.relationKey] as string

  return get(targetId)
}

const getHasManyRelation = <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  cleanupManager?: CleanupManager
) => {
  const { getList } = cleanupManager
    ? getResourceGetter(definition.targetResourcePath, cleanupManager)
    : getResourceGetter(definition.targetResourcePath)

  const targetFilters = [
    where(definition.relationKey as string, '==', source.id),
  ]

  return getList(targetFilters)
}

/** Retorna os ids do target path associados a este source de uma relacao many-to-many */
export const getManyToManyTargetIds = async <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>
) => {
  const bridgeQuery = query(
    collection(db, definition.manyToManyTable),
    where(source.resourcePath, '==', source.id)
  )

  const bridgeSnapshot = await getDocs(bridgeQuery)

  if (bridgeSnapshot.empty) return []

  return bridgeSnapshot.docs.map((doc) => ({
    targetId: doc.data()[definition.targetResourcePath] as string,
    bridgeId: doc.id,
  }))
}

const getManyToManyRelation = async <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>,
  cleanupManager?: CleanupManager
) => {
  const { getList } = cleanupManager
    ? getResourceGetter(definition.targetResourcePath, cleanupManager)
    : getResourceGetter(definition.targetResourcePath)

  // Essa query encontra os ids dos alvos mapeados a esse source
  const targetIds = (await getManyToManyTargetIds(source, definition)).map(
    ({ targetId }) => targetId
  )

  if (targetIds.length === 0) return []

  return getList([where(documentId(), 'in', targetIds)])
}
