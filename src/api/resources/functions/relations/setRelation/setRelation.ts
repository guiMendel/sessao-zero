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

/** Um map de definicoes de relacao do target resource path */
type TargetsRelations<
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
  // @ts-ignore
> = RelationSettings<RelationSettings<P>[R]['targetResourcePath']>

/** Retorna o tipo do target, mas retorna never para relacoes has-many se a relacao oposta dada pelo targetResourcePath for required e has-one */
// Aqui never eh usado de 2 formas diferentes: primeiro para gerar uma tupla vazia, depois para proibir um tipo invalido
type ValidHasManyTarget<
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
> = [
  // Gera um objeto que mapeia as relacoes opostas a true se for a condicao proibida, e a never se for de boas
  {
    // @ts-ignore
    [OR in keyof TargetsRelations<
      P,
      R
      // 1. A relacao deve ser has-many
      // @ts-ignore
    >]: RelationSettings<P>[R]['type'] extends 'has-many'
      ? // A relacao oposta deve ser 'has-one
        // @ts-ignore
        TargetsRelations<P, R>[OR]['type'] extends 'has-one'
        ? // A relacao oposta deve ser required
          // @ts-ignore
          TargetsRelations<P, R>[OR]['required'] extends true
          ? // A relacao e a relacao oposta devem ter a mesma relationKey
            // @ts-ignore
            TargetsRelations<
              P,
              R
              // @ts-ignore
            >[OR]['relationKey'] extends RelationSettings<P>[R]['relationKey']
            ? true
            : never
          : never
        : never
      : never
    // Gera uma uniao dos valores deste objeto, que sera `never` se for de boas, e sera `true` se for proibido
    // Ja que `never | true` === `true`
  }[keyof TargetsRelations<P, R>]
  // Coloca a uniao em uma tupla para verificar contra [never] — explicacao https://stackoverflow.com/questions/53984650/typescript-never-type-inconsistently-matched-in-conditional-type
] extends [never]
  ? // Se for de boas pega o tipo do target da relacao, se nao, proibe com never
    UnrefedResourceRelations<P>[R]
  : never

// declare const test1: ValidHasManyTarget<'players', 'guilds'>
// declare const test2: ValidHasManyTarget<'players', 'ownedGuilds'>
// declare const test3: ValidHasManyTarget<'guilds', 'owner'>
// declare const test4: ValidHasManyTarget<'guilds', 'players'>

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
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath, 'has-one'>

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
  target: UnrefedResourceRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath, 'has-one'>

  if (!Array.isArray(target))
    throw new Error(
      `Tentativa de atribuir um valor nao array a relaçao has-many ${
        relation as string
      }`
    )

  // Se a relacao respectiva do target path for required e has-one, rejeita
  const oppositeRelation = Object.entries(
    relationSettings[definition.targetResourcePath]
  ).filter(
    ([_, oppDefinition]) =>
      oppDefinition.type === 'has-one' &&
      oppDefinition.required &&
      oppDefinition.relationKey === definition.relationKey
  )

  if (oppositeRelation.length > 0) {
    const [oppRelation] = oppositeRelation[0]

    throw new Error(
      `Proibido dar set na relacao ${relation as string} de path ${
        source.resourcePath
      }, pois isso poderia violar a relacao required ${oppRelation} de ${
        definition.targetResourcePath
      }`
    )
  }

  const currentRelations = await getRelation(source, relation)

  // Remove as relacoes atuais que nao estao na nova lista
  let removePromises: Promise<void>[] = []

  if (currentRelations && Array.isArray(currentRelations)) {
    removePromises = currentRelations
      // Pega as que nao estao na nova lista
      .filter((currentRelation) =>
        target.every(
          (targetInstance) => targetInstance.id !== currentRelation.id
        )
      )
      // Troca a relation key para undefined, quebrando a relacao
      .map((currentRelation) =>
        updateResource(definition.targetResourcePath, currentRelation.id, {
          [definition.relationKey]: undefined,
        })
      )
  }

  // Adiciona as novas
  const addPromises = target
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

  return Promise.all([...removePromises, ...addPromises])
}

const setManyToManyRelation = async <
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
>(
  source: Resource<P>,
  relation: R,
  target: UnrefedResourceRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath, 'many-to-many'>

  if (!Array.isArray(target))
    throw new Error(
      `Tentativa de atribuir um valor nao array a relaçao many-to-many ${
        relation as string
      }`
    )

  // Essa query encontra os ids das instancias atualmente mapeados a esse source
  const currentRelatedIds = await getManyToManyTargetIds(source, definition)

  // Remove as relacoes atuais que nao estao na nova lista
  const removePromises = currentRelatedIds
    // Pega as que nao estao na nova lista
    .filter(({ targetId: currentRelatedId }) =>
      target.every((targetInstance) => targetInstance.id !== currentRelatedId)
    )
    // Destroi o doc que estabelece essa relacao
    .map(({ bridgeId }) =>
      deleteDoc(doc(collection(db, definition.manyToManyTable), bridgeId))
    )

  // Adiciona as novas
  const addPromises = target
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

  return Promise.all([...removePromises, ...addPromises])
}
