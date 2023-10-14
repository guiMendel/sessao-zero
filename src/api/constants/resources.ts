import { Guild, Player, Resource } from '@/types'
import { DocumentData, DocumentReference, Query } from 'firebase/firestore'
import { SyncableRef } from '..'

// =======================================================
// DEFINICAO
// =======================================================

/** Os caminhos dos recursos acessiveis no firebase */
export const resourcePaths = ['guilds', 'players'] as const

/** Mapeia um path aos tipos de recurso correspondentes */
export interface Properties {
  guilds: Guild
  players: Player
}

/** Permite definir extratores especificos para os paths */
const customPropertyExtractors: CustomPropertyExtractor = {}

/** Define os nomes das relacoes que serao injetadas em cada recurso */
export const relationSettings = {
  guilds: {
    owner: isOne('players', { relationKey: 'ownerUid' }),
  },
  players: {
    ownedGuilds: isMany('guilds', { relationKey: 'ownerUid' }),
  },
} satisfies Partial<{
  [path in ResourcePath]: Record<
    string,
    RelationDefinition<path, any, RelationType>
  >
}>

// =======================================================
// IMPLEMENTACAO
// =======================================================

// === TIPOS PRINCIPAIS

/** Os tipos dos paths disponiveis */
export type ResourcePath = (typeof resourcePaths)[number]

/** Os tipos de propriedades dos recursos */
export type ResourceProperties = Properties[ResourcePath]

/** Facilita a referencia do recurso das propriedades do path + suas relacoes */
export type FullInstance<P extends ResourcePath> = Resource<Properties[P]> &
  Relations<P>

// === EXTRATORES

/** Descreve como trasnformar os dados de um Document nas propriedades do resource */
export type PropertyExtractor<P extends ResourcePath> = (
  id: string,
  documentData: DocumentData
) => Properties[P]

/** O tipo do objeto com extratores personalizados */
type CustomPropertyExtractor = Partial<{
  [path in ResourcePath]: PropertyExtractor<path>
}>

/** Por padrao, o extrator passa os dados do doc para o recurso diretamente */
const defaultExtractor = <P extends ResourcePath>(
  _: string,
  documentData: DocumentData
) =>
  ({
    ...documentData,
  } as Properties[P])

/** Retorna um PropertyExtrator para este path */
export const getPropertyExtrator = <P extends ResourcePath>(
  resourcePath: P
): PropertyExtractor<P> =>
  customPropertyExtractors[resourcePath] ?? defaultExtractor<P>

// === RELACOES

/** Tipos de relacao possiveis */
type RelationType = 'has-one' | 'has-many'

/** Define uma relacao entre um path S e um path T */
export type RelationDefinition<
  S extends ResourcePath,
  T extends ResourcePath,
  TY extends RelationType = RelationType
> = {
  resourcePath: T
  type: TY
  relationKey: keyof Properties[TY extends 'has-one'
    ? S
    : TY extends 'has-many'
    ? T
    : S | T]
}

/** Dado um path P, retorna as relacoes mapeadas com suas configuracoes */
export type RelationSettings<P extends ResourcePath> = {
  [relation in keyof (typeof relationSettings)[P]]: (typeof relationSettings)[P][relation]
}

/** Dado um path P, retorna suas relacoes */
export type Relations<P extends ResourcePath> = {
  [relation in keyof RelationSettings<P>]: SyncableRef<
    // @ts-ignore
    RelationSettings<P>[relation]['resourcePath'],
    // @ts-ignore
    RelationSettings<P>[relation]['type'] extends 'has-one'
      ? DocumentReference
      : Query
  >
}

// declare const test: FullInstance<'guilds'>

// test.owner

/** Constroi uma definicao de relacao 1:n */
function isMany<S extends ResourcePath, T extends ResourcePath>(
  resourcePath: T,
  { relationKey }: { relationKey: keyof Properties[T] }
): RelationDefinition<S, T, 'has-many'> {
  return { relationKey, resourcePath, type: 'has-many' } as const
}

/** Constroi uma definicao de relacao n:1 */
function isOne<S extends ResourcePath, T extends ResourcePath>(
  resourcePath: T,
  { relationKey }: { relationKey: keyof Properties[S] }
): RelationDefinition<S, T, 'has-one'> {
  return { relationKey, resourcePath, type: 'has-one' } as const
}
