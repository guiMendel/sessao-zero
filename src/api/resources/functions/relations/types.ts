import type {
  RelationSettings,
  ResourcePath,
  UnrefedResourceRelations,
} from '../..'

/** Um map de definicoes de relacao do target resource path */
type TargetsRelations<
  P extends ResourcePath,
  R extends keyof UnrefedResourceRelations<P>
  // @ts-ignore
> = RelationSettings<RelationSettings<P>[R]['targetResourcePath']>

/** Retorna o tipo do target, mas retorna never para relacoes has-many se a relacao oposta dada pelo targetResourcePath for required e has-one */
// Aqui never eh usado de 2 formas diferentes: primeiro para gerar uma tupla vazia, depois para proibir um tipo invalido
export type ValidHasManyTarget<
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

/** Dado um path P, retorna as relacoes has-one dele */
export type OptionalHasOneRelations<P extends ResourcePath> = {
  // @ts-ignore
  [R in keyof RelationSettings<P>]: RelationSettings<P>[R]['type'] extends 'has-one'
    ? // @ts-ignore
      RelationSettings<P>[R]['required'] extends false
      ? R
      : never
    : never
}[keyof RelationSettings<P>]

/** Dado um path P, retorna as relacoes has-one dele */
export type NonHasOneRelations<P extends ResourcePath> = {
  // @ts-ignore
  [R in keyof RelationSettings<P>]: RelationSettings<P>[R]['type'] extends 'has-one'
    ? never
    : R
}[keyof RelationSettings<P>]
