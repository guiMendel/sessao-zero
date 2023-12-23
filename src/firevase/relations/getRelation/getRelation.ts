import { db } from '@/api/firebase'
import { HalfResource, Resource, getResourceGetter } from '@/firevase/resources'
import { GenericClient, PathsFrom, RelationsFrom } from '@/firevase/types'
import { CleanupManager } from '@/utils/classes'
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { RelationDefinitionFrom, Relations } from '..'

/** Retorna a(s) instancia(s) associada a relacao de um recurso, como Resource */
export function getRelation<
  C extends GenericClient,
  P extends PathsFrom<C>,
  R extends keyof Relations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  cleanupManager: CleanupManager
): Promise<
  // @ts-ignore
  RelationsFrom<C>[P][R]['type'] extends 'has-one'
    ? // @ts-ignore
      Resource<C, RelationsFrom<C>[P][R]['targetResourcePath']> | undefined
    : // @ts-ignore
      Resource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]
>

/** Retorna a(s) instancia(s) associada a relacao de um recurso, como HalfResource */
export function getRelation<
  C extends GenericClient,
  P extends PathsFrom<C>,
  R extends keyof Relations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R
): Promise<
  // @ts-ignore
  RelationsFrom<C>[P][R]['type'] extends 'has-one'
    ? // @ts-ignore
      HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']> | undefined
    : // @ts-ignore
      HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]
>

export function getRelation<
  C extends GenericClient,
  P extends PathsFrom<C>,
  R extends keyof Relations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  cleanupManager?: CleanupManager
) {
  const definition = client.relationSettings?.[source.resourcePath]?.[
    relation as any
  ] as RelationDefinitionFrom<C, P, PathsFrom<C>> | undefined

  if (definition == undefined)
    throw new Error(
      `Can't get relation ${relation as string} from ${
        source.resourcePath as string
      } — firevase client relation settings don't exist for it`
    )

  switch (definition.type) {
    case 'has-one':
      return getHasOneRelation(
        source,
        definition as RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-one'>,
        cleanupManager
      )

    case 'has-many':
      return getHasManyRelation(
        source,
        definition as RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-many'>,
        cleanupManager
      )

    case 'many-to-many':
      return getManyToManyRelation(
        source,
        definition as RelationDefinitionFrom<
          C,
          P,
          PathsFrom<C>,
          'many-to-many'
        >,
        cleanupManager
      )

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

const getHasOneRelation = <C extends GenericClient, P extends PathsFrom<C>>(
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-one'>,
  cleanupManager?: CleanupManager
) => {
  const { get } = cleanupManager
    ? getResourceGetter(definition.targetResourcePath, cleanupManager)
    : getResourceGetter(definition.targetResourcePath)

  const targetId = source[definition.relationKey] as string

  return get(targetId)
}

const getHasManyRelation = <C extends GenericClient, P extends PathsFrom<C>>(
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-many'>,
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
export const getManyToManyTargetIds = async <
  C extends GenericClient,
  P extends PathsFrom<C>
>(
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'many-to-many'>
) => {
  const bridgeQuery = query(
    collection(db, definition.manyToManyTable),
    where(source.resourcePath as string, '==', source.id)
  )

  const bridgeSnapshot = await getDocs(bridgeQuery)

  if (bridgeSnapshot.empty) return []

  return bridgeSnapshot.docs.map((doc) => ({
    targetId: doc.data()[definition.targetResourcePath as string],
    bridgeId: doc.id,
  }))
}

const getManyToManyRelation = async <
  C extends GenericClient,
  P extends PathsFrom<C>
>(
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'many-to-many'>,
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
