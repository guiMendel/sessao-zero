import { DocumentData, DocumentReference, Query } from 'firebase/firestore'
import { Resource } from '.'
import { SyncableRef } from '../classes'
import { Guild } from '../resourcePaths/guilds'
import { Player } from '../resourcePaths/players'

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

/** Permite definir nomes para tabelas de many-to-many */
export type ManyToManyTable = 'players-guilds'

/** Define os nomes das relacoes que serao injetadas em cada recurso */
export const relationSettings = {
  guilds: {
    owner: isOne('players', { relationKey: 'ownerUid' }),
    players: isMany('players', { manyToManyTable: 'players-guilds' }),
  },
  players: {
    ownedGuilds: isMany('guilds', { relationKey: 'ownerUid' }),
    guilds: isMany('guilds', { manyToManyTable: 'players-guilds' }),
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
export type FullInstance<P extends ResourcePath> = Resource<P> & Relations<P>

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
type RelationType = 'has-one' | 'has-many' | 'many-to-many'

/** Define uma relacao entre um path S e um path T */
export type RelationDefinition<
  S extends ResourcePath,
  T extends ResourcePath,
  TY extends RelationType = RelationType
> = {
  targetResourcePath: T
  type: TY
} & (TY extends 'many-to-many'
  ? { manyToManyTable: ManyToManyTable }
  : {
      relationKey: keyof Properties[TY extends 'has-one'
        ? S
        : TY extends 'has-many'
        ? T
        : S | T]
    })

/** Dado um path P, retorna as relacoes mapeadas com suas configuracoes */
export type RelationSettings<P extends ResourcePath> = {
  [relation in keyof (typeof relationSettings)[P]]: (typeof relationSettings)[P][relation]
}

/** Dado um path P, retorna suas relacoes */
export type Relations<P extends ResourcePath> = {
  [relation in keyof RelationSettings<P>]: SyncableRef<
    // @ts-ignore
    RelationSettings<P>[relation]['targetResourcePath'],
    // @ts-ignore
    RelationSettings<P>[relation]['type'] extends 'has-one'
      ? DocumentReference
      : Query
  >
}

// declare const test: FullInstance<'players'>

// test.guilds.value

// declare const test: FullInstance<'guilds'>

// test.owner.value

/** Constroi uma definicao de relacao 1:n */
function isMany<S extends ResourcePath, T extends ResourcePath>(
  targetResourcePath: T,
  { relationKey }: { relationKey: keyof Properties[T] }
): RelationDefinition<S, T, 'has-many'>

/** Constroi uma definicao de relacao n:n */
function isMany<S extends ResourcePath, T extends ResourcePath>(
  targetResourcePath: T,
  { manyToManyTable }: { manyToManyTable: ManyToManyTable }
): RelationDefinition<S, T, 'many-to-many'>

function isMany<S extends ResourcePath, T extends ResourcePath>(
  targetResourcePath: T,
  key:
    | { manyToManyTable: ManyToManyTable }
    | { relationKey: keyof Properties[T] }
): RelationDefinition<S, T, 'many-to-many' | 'has-many'> {
  return 'relationKey' in key
    ? { relationKey: key.relationKey, targetResourcePath, type: 'has-many' }
    : {
        manyToManyTable: key.manyToManyTable,
        targetResourcePath,
        type: 'many-to-many',
      }
}

/** Constroi uma definicao de relacao n:1 */
function isOne<S extends ResourcePath, T extends ResourcePath>(
  targetResourcePath: T,
  { relationKey }: { relationKey: keyof Properties[S] }
): RelationDefinition<S, T, 'has-one'> {
  return { relationKey, targetResourcePath, type: 'has-one' }
}
