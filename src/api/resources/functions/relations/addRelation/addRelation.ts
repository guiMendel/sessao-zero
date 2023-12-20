import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import {
  Properties,
  RelationDefinition,
  Resource,
  ResourcePath,
  UnrefedResourceRelations,
  relationSettings,
  RelationSettings,
} from '../../..'
import { updateResource } from '../../write'
import { getManyToManyTargetIds, getRelation } from '../getRelation'
import { db } from '@/api/firebase'

/** Permite adicionar um novo valor para uma relaçao
 * @param source A instancia que vai receber uma nova instancia a relacao
 * @param relation A relaçao a adicionar (nao pode ser has-one)
 * @param target O novo valor para essa relaçao
 */
export const addRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  // @ts-ignore
  target: RelationSettings<P>[R]['type'] extends 'has-one'
    ? never
    : UnrefedResourceRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath>

  switch (definition.type) {
    case 'has-one':
      throw new Error(
        `Tentativa de adicionar nova relaçao para a relation ${
          relation as string
        }, de path ${source.resourcePath}`
      )

    case 'has-many':
      return addHasManyRelation(source, relation, target)

    case 'many-to-many':
      return addManyToManyRelation(source, relation, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: Resource<'players'>
// declare const guild: Resource<'guilds'>

// addRelation(player, 'ownedGuilds', [guild])
// addRelation(guild, 'owner', player)
// addRelation(guild, 'players', [player])

export const internalAddHasManyRelations = <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  // @ts-ignore
  target: Resource<RelationSettings<P>[R]['targetResourcePath']>[],
  // @ts-ignore
  currentRelations: Resource<RelationSettings<P>[R]['targetResourcePath']>[]
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
      updateResource(definition.targetResourcePath, targetInstance.id, {
        [definition.relationKey]: source.id,
      })
    )

const addHasManyRelation = async <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  rawTarget: UnrefedResourceRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath, 'has-many'>

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) /* @ts-ignore */ /* @ts-ignore */ as Resource<
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  const currentRelations = (await getRelation(source, relation)) as Resource<
    // @ts-ignore
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  // Adiciona as novas
  return internalAddHasManyRelations(
    source,
    definition,
    target,
    currentRelations
  )
}

export const internalAddManyToManyRelations = <P extends ResourcePath>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>,
  // @ts-ignore
  target: Resource<RelationSettings<P>[R]['targetResourcePath']>[],
  // @ts-ignore
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
      addDoc(collection(db, definition.manyToManyTable), {
        [source.resourcePath]: source.id,
        [definition.targetResourcePath]: targetInstance.id,
      })
    )

const addManyToManyRelation = async <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  rawTarget: UnrefedResourceRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath, 'many-to-many'>

  const target = (
    Array.isArray(rawTarget) ? rawTarget : [rawTarget]
  ) /* @ts-ignore */ /* @ts-ignore */ as Resource<
    RelationSettings<P>[R]['targetResourcePath']
  >[]

  // Essa query encontra os ids das instancias atualmente mapeados a esse source
  const currentRelatedIds = await getManyToManyTargetIds(source, definition)

  // Adiciona as novas
  return internalAddManyToManyRelations(
    source,
    definition,
    target,
    currentRelatedIds
  )
}
