import { db } from '@/api/firebase'
import { collection, deleteDoc, doc } from 'firebase/firestore'
import {
  Properties,
  RelationDefinition,
  RelationSettings,
  Resource,
  ResourcePath,
  UnrefedResourceRelations,
  relationSettings,
} from '../../..'
import { updateResource } from '../../write'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import {
  NonHasOneRelations,
  OptionalHasOneRelations,
  ValidHasManyTarget,
} from '../types'
import { detectInvalidRemove, getDefinition } from '../utils'

/** Permite remover uma relacao has-one
 * @param source De onde remover as relacoes
 * @param relation A relaçao a remover
 * @param target As instancias a serem removidas
 */
export function removeRelation<P extends ResourcePath>(
  source: Resource<P>,
  relation: OptionalHasOneRelations<P>
): Promise<void>

/** Permite remover instancias de uma relaçao
 * @param source De onde remover as relacoes
 * @param relation A relaçao a remover
 * @param target As instancias a serem removidas
 */
export function removeRelation<
  P extends ResourcePath,
  R extends NonHasOneRelations<P>
>(
  source: Resource<P>,
  relation: R,
  // @ts-ignore
  target: ValidHasManyTarget<P, R>
): Promise<void>

export function removeRelation<
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(source: Resource<P>, relation: R, target?: ValidHasManyTarget<P, R>) {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath>

  if (definition.type === 'has-one')
    return removeHasOneRelation(
      source,
      relation as unknown as OptionalHasOneRelations<P>
    )

  if (target == undefined)
    throw new Error(
      `Tentativa de remover da relacao ${relation as string} de tipo ${
        definition.type
      }, do path ${source.resourcePath}, sem fornecer nenhum target`
    )

  switch (definition.type) {
    case 'has-many':
      return removeHasManyRelation(source, relation, target)

    case 'many-to-many':
      return removeManyToManyRelation(source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: Resource<'players'>
// declare const guild: Resource<'guilds'>

// removeRelation(player, 'ownedGuilds', [guild])
// removeRelation(guild, 'owner')
// removeRelation(guild, 'players', [player])

const removeHasOneRelation = <P extends ResourcePath>(
  source: Resource<P>,
  relation: OptionalHasOneRelations<P>
) => {
  const definition = getDefinition(source.resourcePath, relation, 'has-one')

  // Rejeita se for required e undefined
  if (definition.required)
    throw new Error(
      `Tentativa de remover relacao required ${relation as unknown as string}`
    )

  return updateResource(source.resourcePath, source.id, {
    [definition.relationKey]: undefined,
  } as Partial<Properties[P]>)
}

export const internalRemoveHasManyRelations = <P extends ResourcePath>(
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  // @ts-ignore
  target: Resource<RelationSettings<P>[R]['targetResourcePath']>[],
  // @ts-ignore
  currentRelations: Resource<RelationSettings<P>[R]['targetResourcePath']>[]
) =>
  currentRelations
    // Pega as que nao estao na nova lista
    .filter((currentRelation) =>
      target.every((targetInstance) => targetInstance.id !== currentRelation.id)
    )
    // Troca a relation key para undefined, quebrando a relacao
    .map((currentRelation) =>
      updateResource(definition.targetResourcePath, currentRelation.id, {
        [definition.relationKey]: undefined,
      })
    )

const removeHasManyRelation = async <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  rawTarget: UnrefedResourceRelations<P>[R]
) => {
  const definition = getDefinition(source.resourcePath, relation, 'has-many')

  detectInvalidRemove(source.resourcePath, relation)

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) /* @ts-ignore */ /* @ts-ignore */ as Resource<
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  const currentRelations = (await getRelation(source, relation)) as Resource<
    // @ts-ignore
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  return Promise.all(
    internalRemoveHasManyRelations(definition, target, currentRelations)
  )
}

export const internalRemoveManyToManyRelations = <P extends ResourcePath>(
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>,
  // @ts-ignore
  target: Resource<RelationSettings<P>[R]['targetResourcePath']>[],
  // @ts-ignore
  currentRelatedIds: {
    targetId: string
    bridgeId: string
  }[]
) =>
  currentRelatedIds
    // Pega as que nao estao na nova lista
    .filter(({ targetId: currentRelatedId }) =>
      target.every((targetInstance) => targetInstance.id !== currentRelatedId)
    )
    // Destroi o doc que estabelece essa relacao
    .map(({ bridgeId }) =>
      deleteDoc(doc(collection(db, definition.manyToManyTable), bridgeId))
    )

const removeManyToManyRelation = async <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  rawTarget: UnrefedResourceRelations<P>[R]
) => {
  const definition = getDefinition(
    source.resourcePath,
    relation,
    'many-to-many'
  )

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) /* @ts-ignore */ /* @ts-ignore */ as Resource<
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  // Essa query encontra os ids das instancias atualmente mapeados a esse source
  const currentRelatedIds = await getManyToManyTargetIds(source, definition)

  // Remove as relacoes atuais que nao estao na nova lista
  return Promise.all(
    internalRemoveManyToManyRelations(definition, target, currentRelatedIds)
  )
}
