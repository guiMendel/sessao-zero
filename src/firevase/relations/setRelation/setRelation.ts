import { FirevaseClient } from '@/firevase'
import { HalfResource, updateResource } from '@/firevase/resources'
import { PathsFrom, PropertiesFrom, RelationsFrom } from '@/firevase/types'
import { HalfResourceRelations } from '..'
import {
  internalAddHasManyRelations,
  internalAddManyToManyRelations,
} from '../addRelation'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import { ValidHasManyTarget } from '../internalTypes'
import {
  internalRemoveHasManyRelations,
  internalRemoveManyToManyRelations,
} from '../removeRelation'
import { detectInvalidRemove, requireDefinition } from '../utils'

/** Permite sobrescrever um novo valor para uma relaçao
 * @param source A instancia que vai ter sua relaçao sobrescrita
 * @param relation A relaçao a sobrescrever
 * @param target O novo valor para essa relaçao
 */
export const setRelation = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  target: ValidHasManyTarget<C, P, R>
) => {
  const definition = requireDefinition(client, source.resourcePath, relation)

  switch (definition.type) {
    case 'has-one':
      return setHasOneRelation(client, source, relation, target)

    case 'has-many':
      return setHasManyRelation(client, source, relation, target)

    case 'many-to-many':
      return setManyToManyRelation(client, source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

const setHasOneRelation = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  target: RelationsFrom<C>[P][R]['protected'] extends true
    ? HalfResourceRelations<C, P>[R]
    : HalfResourceRelations<C, P>[R] | undefined
) => {
  const definition = requireDefinition(
    client,
    source.resourcePath,
    relation,
    'has-one'
  )

  // Rejeita arrays
  if (Array.isArray(target))
    throw new Error(
      `Tentativa de atribuir um array a relaçao has-one ${relation as string}`
    )

  // Rejeita se for protected e undefined
  if (definition.protected && target == undefined)
    throw new Error(
      `Tentativa de atribuir undefined para a relacao protected ${
        relation as string
      }`
    )

  return updateResource<C, P>(client, source.resourcePath, source.id, {
    [definition.relationKey]: target?.id,
  } as Partial<PropertiesFrom<C>[P]>)
}

const setHasManyRelation = async <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  rawTarget: HalfResourceRelations<C, P>[R]
) => {
  const definition = requireDefinition(
    client,
    source.resourcePath,
    relation,
    'has-many'
  )

  detectInvalidRemove(client, source.resourcePath, relation)

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) as HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]

  const currentRelations = (await getRelation(
    client,
    source,
    relation
  )) as HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]

  // Remove as relacoes atuais que nao estao na nova lista
  const removePromises = internalRemoveHasManyRelations(
    client,
    definition,
    target,
    currentRelations
  )

  // Adiciona as novas
  const addPromises = internalAddHasManyRelations(
    client,
    source,
    definition,
    target,
    currentRelations ?? []
  )

  return Promise.all([...removePromises, ...addPromises])
}

const setManyToManyRelation = async <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  rawTarget: HalfResourceRelations<C, P>[R]
) => {
  const definition = requireDefinition(
    client,
    source.resourcePath,
    relation,
    'many-to-many'
  )
  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) as HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]

  // Essa query encontra os ids das instancias atualmente mapeados a esse source
  const currentRelatedIds = await getManyToManyTargetIds<C, P>(
    client,
    source,
    definition
  )

  // Remove as relacoes atuais que nao estao na nova lista
  const removePromises = internalRemoveManyToManyRelations(
    client,
    definition,
    target,
    currentRelatedIds
  )

  // Adiciona as novas
  const addPromises = internalAddManyToManyRelations(
    client,
    source,
    definition,
    target,
    currentRelatedIds
  )

  return Promise.all([...removePromises, ...addPromises])
}

// declare const player: HalfResource<Vase, 'players'>
// declare const guild: HalfResource<Vase, 'guilds'>

// setRelation(vase, player, 'guilds', [guild])
// setRelation(vase, player, 'ownedGuilds', [guild])
// setRelation(vase, guild, 'owner', player)
// setRelation(vase, guild, 'players', [player])
