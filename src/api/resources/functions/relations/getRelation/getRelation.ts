import { db } from '@/api/firebase'
import {
  RelationDefinition,
  Resource,
  ResourcePath,
  UnrefedRelations,
  getResourceGetter,
  relationSettings,
} from '@/api/resources'
import { CleanupManager } from '@/utils/classes'
import { collection, getDocs, query, where } from 'firebase/firestore'

export const getRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  relation: R,
  cleanupManager: CleanupManager
) => {
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
  cleanupManager: CleanupManager
) => {
  const { get } = getResourceGetter(
    definition.targetResourcePath,
    cleanupManager
  )

  const targetId = source[definition.relationKey] as string

  return get(targetId)
}

const getHasManyRelation = <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  cleanupManager: CleanupManager
) => {
  const { getList } = getResourceGetter(
    definition.targetResourcePath,
    cleanupManager
  )

  const targetFilters = [
    where(definition.relationKey as string, '==', source.id),
  ]

  return getList(targetFilters)
}

const getManyToManyRelation = async <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>,
  cleanupManager: CleanupManager
) => {
  const { getList } = getResourceGetter(
    definition.targetResourcePath,
    cleanupManager
  )

  // Essa query encontra os ids dos alvos mapeados a esse source
  const bridgeQuery = query(
    collection(db, definition.manyToManyTable),
    where(source.resourcePath, '==', source.id)
  )

  const bridgeSnapshot = await getDocs(bridgeQuery)

  if (bridgeSnapshot.empty) return []

  const targetIds = bridgeSnapshot.docs.map(
    (doc) => doc.data()[definition.targetResourcePath]
  )

  const targetFilters = [where('id', 'in', targetIds)]

  return getList(targetFilters)
}
