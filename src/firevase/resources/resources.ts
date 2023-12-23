// import { DocumentData, DocumentReference, Query } from 'firebase/firestore'
// import { Resource } from '.'
// import { SyncableRef } from '../classes'
// import { Guild } from '../resourcePaths/guilds'
// import { Player } from '../resourcePaths/players'

// // =======================================================
// // DEFINICAO
// // =======================================================

// /** Os caminhos dos recursos acessiveis no firebase */
// export const resourcePaths = ['guilds', 'players'] as const

// /** Mapeia um path aos tipos de recurso correspondentes */
// export interface Properties {
//   guilds: Guild
//   players: Player
// }

// /** Permite definir extratores especificos para os paths */
// const customPropertyExtractors: CustomPropertyExtractor = {}

// /** Permite definir nomes para tabelas de many-to-many */
// export const manyToManySettings = {
//   playersGuilds: ['guilds', 'players'],
// } satisfies Record<string, [ResourcePath, ResourcePath]>

// /** Define os nomes das relacoes que serao injetadas em cada recurso */
// export const relationSettings = {
//   guilds: {
//     owner: isOne('players', { relationKey: 'ownerUid' }, 'required'),
//     players: isMany('players', { manyToManyTable: 'playersGuilds' }),
//   },

//   players: {
//     ownedGuilds: isMany('guilds', { relationKey: 'ownerUid' }),
//     guilds: isMany('guilds', { manyToManyTable: 'playersGuilds' }),
//   },
// } satisfies Partial<{
//   [path in ResourcePath]: Record<
//     string,
//     RelationDefinition<path, any, RelationType, boolean>
//   >
// }>

// // =======================================================
// // IMPLEMENTACAO
// // =======================================================

// // === TIPOS PRINCIPAIS

// /** Os tipos dos paths disponiveis */
// export type ResourcePath = (typeof resourcePaths)[number]

// /** Os tipos de propriedades dos recursos */
// export type ResourceProperties = Properties[ResourcePath]

// /** Facilita a referencia do recurso das propriedades do path + suas relacoes */
// export type FullInstance<P extends ResourcePath> = Resource<P> & Relations<P>

// /** Facilita a referencia do recurso das propriedades do path + suas relacoes (sem um ref) */
// export type UnrefedFullInstance<P extends ResourcePath> = Resource<P> &
//   UnrefedRelations<P>

// // === EXTRATORES

// /** Descreve como trasnformar os dados de um Document nas propriedades do resource */
// export type PropertyExtractor<P extends ResourcePath> = (
//   id: string,
//   documentData: DocumentData
// ) => Properties[P]

// /** O tipo do objeto com extratores personalizados */
// type CustomPropertyExtractor = Partial<{
//   [path in ResourcePath]: PropertyExtractor<path>
// }>

// /** Por padrao, o extrator passa os dados do doc para o recurso diretamente */
// const defaultExtractor = <P extends ResourcePath>(
//   _: string,
//   documentData: DocumentData
// ) =>
//   ({
//     ...documentData,
//   } as Properties[P])

// /** Retorna um PropertyExtrator para este path */
// export const getPropertyExtrator = <P extends ResourcePath>(
//   resourcePath: P
// ): PropertyExtractor<P> =>
//   customPropertyExtractors[resourcePath] ?? defaultExtractor<P>

// // === RELACOES

// /** Tipos de relacao possiveis */
// export type RelationType = 'has-one' | 'has-many' | 'many-to-many'

// /** Mapeia cada many-to-many aos paths que os compoem */
// export type ManyToManySettings = typeof manyToManySettings

// /** Nomes de tabelas de many-to-many */
// export type ManyToManyTable = keyof ManyToManySettings

// /** Define uma relacao entre um path S e um path T */
// export type RelationDefinition<
//   S extends ResourcePath,
//   T extends ResourcePath,
//   TY extends RelationType = RelationType,
//   R extends boolean = false
// > = {
//   targetResourcePath: T
//   type: TY
//   required: R
// } & (TY extends 'many-to-many'
//   ? { manyToManyTable: ManyToManyTable }
//   : {
//       relationKey: keyof Properties[TY extends 'has-one'
//         ? S
//         : TY extends 'has-many'
//         ? T
//         : S | T]
//     })

// /** Dado um path P, retorna as relacoes mapeadas com suas configuracoes */
// export type RelationSettings<P extends ResourcePath> = {
//   [relation in keyof (typeof relationSettings)[P]]: (typeof relationSettings)[P][relation]
// }

// /** Dado um path P, retorna suas relacoes */
// export type Relations<P extends ResourcePath> = {
//   [relation in keyof RelationSettings<P>]: SyncableRef<
//     // @ts-ignore
//     RelationSettings<P>[relation]['targetResourcePath'],
//     // @ts-ignore
//     RelationSettings<P>[relation]['type'] extends 'has-one'
//       ? DocumentReference
//       : Query
//   >
// }

// /** Dado um path P, retorna suas relacoes (sem um ref) */
// export type UnrefedRelations<P extends ResourcePath> = {
//   // @ts-ignore
//   [relation in keyof RelationSettings<P>]: RelationSettings<P>[relation]['type'] extends 'has-one'
//     ? // @ts-ignore
//       FullInstance<RelationSettings<P>[relation]['targetResourcePath']>
//     : // @ts-ignore
//       FullInstance<RelationSettings<P>[relation]['targetResourcePath']>[]
// }

// /** Dado um path P, retorna suas relacoes (sem um ref) */
// export type UnrefedResourceRelations<P extends ResourcePath> = {
//   // @ts-ignore
//   [relation in keyof RelationSettings<P>]: RelationSettings<P>[relation]['type'] extends 'has-one'
//     ? // @ts-ignore
//       Resource<RelationSettings<P>[relation]['targetResourcePath']>
//     : // @ts-ignore
//       Resource<RelationSettings<P>[relation]['targetResourcePath']>[]
// }

// /** Dado 2 paths P e Q, retorna as many-to-many tables que incluem eles */
// export type ResourceManyToManyTables<
//   P extends ResourcePath,
//   Q extends ResourcePath
// > = {
//   [T in ManyToManyTable]: ManyToManySettings[T] extends [P, Q]
//     ? T
//     : ManyToManySettings[T] extends [Q, P]
//     ? T
//     : never
// }[ManyToManyTable]
