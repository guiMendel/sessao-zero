import {
  Properties,
  RelationDefinition,
  RelationSettings,
  Resource,
  ResourcePath,
  UnrefedResourceRelations,
  relationSettings,
} from '../../resources'
import { updateResource } from '../../resources/functions/write'
import {
  internalAddHasManyRelations,
  internalAddManyToManyRelations,
} from '../addRelation'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import {
  internalRemoveHasManyRelations,
  internalRemoveManyToManyRelations,
} from '../removeRelation'
import { ValidHasManyTarget } from '../types'
import { detectInvalidRemove, getDefinition } from '../utils'

/** Permite sobrescrever um novo valor para uma relaçao
 * @param source A instancia que vai ter sua relaçao sobrescrita
 * @param relation A relaçao a sobrescrever
 * @param target O novo valor para essa relaçao
 */
export const setRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  target: ValidHasManyTarget<P, R>
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath>

  switch (definition.type) {
    case 'has-one':
      return setHasOneRelation(source, relation, target)

    case 'has-many':
      return setHasManyRelation(source, relation, target)

    case 'many-to-many':
      return setManyToManyRelation(source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: Resource<'players'>
// declare const guild: Resource<'guilds'>

// setRelation(player, 'ownedGuilds', [guild])
// setRelation(guild, 'owner', player)
// setRelation(guild, 'players', [player])

const setHasOneRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  // @ts-ignore
  target: RelationSettings<P>[R]['required'] extends true
    ? UnrefedResourceRelations<P>[R]
    : UnrefedResourceRelations<P>[R] | undefined
) => {
  const definition = getDefinition(source.resourcePath, relation, 'has-one')

  // Rejeita arrays
  if (Array.isArray(target))
    throw new Error(
      `Tentativa de atribuir um array a relaçao has-one ${relation as string}`
    )

  // Rejeita se for required e undefined
  if (definition.required && target == undefined)
    throw new Error(
      `Tentativa de atribuir undefined para a relacao required ${
        relation as string
      }`
    )

  return updateResource(source.resourcePath, source.id, {
    [definition.relationKey]: target?.id,
  } as Partial<Properties[P]>)
}

const setHasManyRelation = async <
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

  // Remove as relacoes atuais que nao estao na nova lista
  const removePromises = internalRemoveHasManyRelations(
    definition,
    target,
    currentRelations
  )

  // Adiciona as novas
  const addPromises = internalAddHasManyRelations(
    source,
    definition,
    target,
    currentRelations ?? []
  )

  return Promise.all([...removePromises, ...addPromises])
}

const setManyToManyRelation = async <
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
  const removePromises = internalRemoveManyToManyRelations(
    definition,
    target,
    currentRelatedIds
  )

  // Adiciona as novas
  const addPromises = internalAddManyToManyRelations(
    source,
    definition,
    target,
    currentRelatedIds
  )

  return Promise.all([...removePromises, ...addPromises])
}
