import {
  FullInstance,
  RelationDefinition,
  Relations,
  ResourcePath,
  UnrefedRelations,
  relationSettings,
} from '../..'

/** Permite sobrescrever um novo valor para uma relaçao
 * @param source A instancia que vai ter sua relaçao sobrescrita
 * @param relation A relaçao a sobrescrever
 * @param target O novo valor para essa relaçao
 */
export const setRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: FullInstance<P>,
  relation: R,
  target: UnrefedRelations<P>[R]
) => {
  const definition = relationSettings[source.resourcePath][
    relation
  ] as RelationDefinition<P, any>

  switch (definition.type) {
    case 'has-one':
      return setHasOneRelation(source, definition, target)

    case 'has-many':
      return setHasManyRelation(source, definition, target)

    case 'many-to-many':
      return setManyToManyRelation(source, definition, target)

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

// declare const player: FullInstance<'players'>

// setRelation(player, 'guilds')

export const setHasOneRelation = <
  P extends ResourcePath,
  R extends keyof UnrefedRelations<P>
>(
  source: FullInstance<P>,
  relation: R,
  target: UnrefedRelations<P>[R]
) => {}
