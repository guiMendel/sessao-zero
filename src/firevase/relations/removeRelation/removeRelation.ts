import { db } from '@/api/firebase'
import { collection, deleteDoc, doc } from 'firebase/firestore'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import { detectInvalidRemove, requireDefinition } from '../utils'
import { FirevaseClient } from '@/firevase'
import { PathsFrom, PropertiesFrom, RelationsFrom } from '@/firevase/types'
import { HalfResource, updateResource } from '@/firevase/resources'
import {
  NonHasOneRelations,
  OptionalHasOneRelations,
  ValidHasManyTarget,
} from '../internalTypes'
import { HalfResourceRelations, RelationDefinitionFrom } from '..'

/** Permite remover uma relacao has-one
 * @param source De onde remover as relacoes
 * @param relation A relaçao a remover
 * @param target As instancias a serem removidas
 */
export function removeRelation<
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: OptionalHasOneRelations<C, P>
): Promise<void>

/** Permite remover instancias de uma relaçao
 * @param source De onde remover as relacoes
 * @param relation A relaçao a remover
 * @param target As instancias a serem removidas
 */
export function removeRelation<
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof NonHasOneRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  target: ValidHasManyTarget<C, P, R>
): Promise<void>

export function removeRelation<
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  target?: ValidHasManyTarget<C, P, R>
) {
  const definition = requireDefinition(client, source.resourcePath, relation)

  if (definition.type === 'has-one')
    return removeHasOneRelation(
      client,
      source,
      relation as unknown as OptionalHasOneRelations<C, P>
    )

  if (target == undefined)
    throw new Error(
      `Tentativa de remover da relacao ${relation as string} de tipo ${
        definition.type
      }, do path ${source.resourcePath}, sem fornecer nenhum target`
    )

  switch (definition.type) {
    case 'has-many':
      return removeHasManyRelation(client, source, relation, target)

    case 'many-to-many':
      return removeManyToManyRelation(client, source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: HalfResource<C,'players'>
// declare const guild: HalfResource<C,'guilds'>

// removeRelation(player, 'ownedGuilds', [guild])
// removeRelation(guild, 'owner')
// removeRelation(guild, 'players', [player])

const removeHasOneRelation = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  source: HalfResource<C, P>,
  relation: OptionalHasOneRelations<C, P>
) => {
  const definition = requireDefinition(
    client,
    source.resourcePath,
    relation,
    'has-one'
  )

  // Rejeita se for required e undefined
  if (definition.required)
    throw new Error(
      `Tentativa de remover relacao required ${relation as string}`
    )

  return updateResource(client, source.resourcePath, source.id, {
    [definition.relationKey]: undefined,
  } as Partial<PropertiesFrom<C>[P]>)
}

export const internalRemoveHasManyRelations = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  definition: RelationDefinitionFrom<C, P, keyof PropertiesFrom<C>, 'has-many'>,
  target: HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[],
  currentRelations: HalfResource<
    C,
    RelationsFrom<C>[P][R]['targetResourcePath']
  >[]
) =>
  currentRelations
    // Pega as que nao estao na nova lista
    .filter((currentRelation) =>
      target.every((targetInstance) => targetInstance.id !== currentRelation.id)
    )
    // Troca a relation key para undefined, quebrando a relacao
    .map((currentRelation) =>
      updateResource(
        client,
        definition.targetResourcePath,
        currentRelation.id,
        {
          [definition.relationKey]: undefined,
        } as Partial<PropertiesFrom<C>[keyof PropertiesFrom<C>]>
      )
    )

const removeHasManyRelation = async <
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

  return Promise.all(
    internalRemoveHasManyRelations(client, definition, target, currentRelations)
  )
}

export const internalRemoveManyToManyRelations = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  definition: RelationDefinitionFrom<
    C,
    P,
    keyof C['_tsAnchor'],
    'many-to-many'
  >,
  target: HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[],
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
      deleteDoc(
        doc(
          collection(client.db, definition.manyToManyTable as string),
          bridgeId
        )
      )
    )

const removeManyToManyRelation = async <
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
  const currentRelatedIds = await getManyToManyTargetIds(
    client,
    source,
    definition
  )

  // Remove as relacoes atuais que nao estao na nova lista
  return Promise.all(
    internalRemoveManyToManyRelations(
      client,
      definition,
      target,
      currentRelatedIds
    )
  )
}
