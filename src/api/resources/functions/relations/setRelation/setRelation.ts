import {
  Properties,
  RelationDefinition,
  Resource,
  ResourcePath,
  UnrefedRelations,
  relationSettings,
} from '../../..'
import { updateResource } from '../../write'

/** Permite sobrescrever um novo valor para uma relaçao
 * @param source A instancia que vai ter sua relaçao sobrescrita
 * @param relation A relaçao a sobrescrever
 * @param target O novo valor para essa relaçao
 */
export const setRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  relation: R,
  target: UnrefedRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, ResourcePath>

  switch (definition.type) {
    case 'has-one':
      return setHasOneRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-one'>,
        target
      )

    case 'has-many':
      return setHasManyRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-many'>,
        target
      )

    case 'many-to-many':
      return setManyToManyRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'many-to-many'>,
        target
      )

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: Resource<'players'>

// setRelation(player, 'guilds')

const setHasOneRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-one'>,
  target: UnrefedRelations<P>[R]
) => {
  if (Array.isArray(target))
    throw new Error(`Tentativa de atribuir um array a uma relaçao has-one`)

  return updateResource(source.resourcePath, source.id, {
    [definition.relationKey]: target.id,
  } as Partial<Properties[P]>)
}

const setHasManyRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: Resource<P>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  target: UnrefedRelations<P>[R]
) => {
  if (!Array.isArray(target))
    throw new Error(
      `Tentativa de atribuir um valor nao array a uma relaçao has-many`
    )

  return updateResource(source.resourcePath, source.id, {
    [definition.relationKey]: target.id,
  } as Partial<Properties[P]>)
}
