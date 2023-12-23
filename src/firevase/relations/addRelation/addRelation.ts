import { FirevaseClient } from '@/firevase'
import { HalfResource, updateResource } from '@/firevase/resources'
import { PathsFrom, RelationsFrom } from '@/firevase/types'
import { addDoc, collection } from 'firebase/firestore'
import { HalfResourceRelations, RelationDefinitionFrom } from '..'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import { requireDefinition } from '../utils'

/** Permite adicionar um novo valor para uma relaçao
 * @param source A instancia que vai receber uma nova instancia a relacao
 * @param relation A relaçao a adicionar (nao pode ser has-one)
 * @param target O novo valor para essa relaçao
 */
export const addRelation = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  relation: R,
  target: RelationsFrom<C>[P][R]['type'] extends 'has-one'
    ? never
    : HalfResourceRelations<C, P>[R]
) => {
  const definition = requireDefinition(client, source.resourcePath, relation)

  switch (definition.type) {
    case 'has-one':
      throw new Error(
        `Tentativa de adicionar nova relaçao para a relation ${
          relation as string
        }, de path ${source.resourcePath}`
      )

    case 'has-many':
      return addHasManyRelation(client, source, relation, target)

    case 'many-to-many':
      return addManyToManyRelation(client, source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

export const internalAddHasManyRelations = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-many'>,
  target: HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[],
  currentRelations: HalfResource<
    C,
    RelationsFrom<C>[P][R]['targetResourcePath']
  >[]
) =>
  target
    // Pega as que nao estao na lista existente
    .filter((targetInstance) =>
      currentRelations && Array.isArray(currentRelations)
        ? currentRelations.every(
            (currentRelation) => currentRelation.id !== targetInstance.id
          )
        : true
    )
    // Troca a relation key para a id do source, criando a relacao
    .map((targetInstance) =>
      updateResource(client, definition.targetResourcePath, targetInstance.id, {
        [definition.relationKey]: source.id,
      } as any)
    )

const addHasManyRelation = async <
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

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) as HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]

  const currentRelations = (await getRelation(
    client,
    source,
    relation
  )) as HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[]

  // Adiciona as novas
  return Promise.all(
    internalAddHasManyRelations(
      client,
      source,
      definition,
      target,
      currentRelations
    )
  )
}

export const internalAddManyToManyRelations = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  R extends keyof HalfResourceRelations<C, P>
>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'many-to-many'>,
  target: HalfResource<C, RelationsFrom<C>[P][R]['targetResourcePath']>[],
  currentRelatedIds: {
    targetId: string
    bridgeId: string
  }[]
) =>
  target
    // Pega as que nao estao na lista existente
    .filter((targetInstance) =>
      currentRelatedIds.every(
        ({ targetId: currentRelatedId }) =>
          currentRelatedId !== targetInstance.id
      )
    )
    // Adiciona um doc para estabeler a relacao. Tem o formato de: o resourcePath eh a chave, o id da isntancia relacionada eh o valor.
    .map((targetInstance) =>
      addDoc(collection(client.db, definition.manyToManyTable as string), {
        [source.resourcePath]: source.id,
        [definition.targetResourcePath]: targetInstance.id,
      })
    )

const addManyToManyRelation = async <
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

  // Adiciona as novas
  return Promise.all(
    internalAddManyToManyRelations(
      client,
      source,
      definition,
      target,
      currentRelatedIds
    )
  )
}

// declare const player: HalfResource<Vase, 'players'>
// declare const guild: HalfResource<Vase, 'guilds'>

// addRelation(vase, guild, 'players', [])
