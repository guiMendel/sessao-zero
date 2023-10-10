import {
  FullInstance,
  Properties,
  RelationDefinition,
  Relations,
  ResourcePath,
  relationSettings,
} from '@/api/'
import { SmartRelation } from '.'
import { CleanupManager } from '..'
import { Resource } from '@/types'

/** Define os tipos de relacao */
export type Relation<T> = SmartRelation<T>

/** Adiciona a um objeto uma flag que indica se ele nao deve ser descartado */
export type WithDisposeFlag<T> = T & {
  ignoreDispose?: boolean
}

// type InjectedRelations<
//   P extends ResourceProperties,
//   R extends Record<string, RelationBuilder<P, ResourceProperties>>
// > = {
//   [relation in keyof R]: ReturnType<R[relation]['build']>
// }

/** Constroi um objeto de relacoes para a instancia fornecida
 * @param source O item para o qual gerar as relacoes
 * @param sourceId O id do item para o qual gerar as relacoes
 * @param previousValues Um mapa dos ids para os antigos valores de itens do mesmo tipo de source.
 * Utilizado para evitar reconstruir syncs desnecessarios.
 * @param cleanupManager Permite associar qualquer sync criado a um cleanup
 */
export const buildRelations = <P extends ResourcePath>({
  cleanupManager,
  previousValues,
  source,
  sourcePath,
}: {
  source: Resource<Properties[P]>
  sourcePath: P
  previousValues: Record<string, WithDisposeFlag<FullInstance<P>>>
  cleanupManager: CleanupManager
}): Relations<P> => {
  // Se essa source estiver em previous values, reutiliza as relacoes do previous value
  if (source.id in previousValues) {
    // Marca para nao descartar esses valores
    previousValues[source.id].ignoreDispose = true

    return extractRelations(previousValues[source.id], sourcePath)
  }

  return createRelations(source, sourcePath, cleanupManager)
}

const createRelations = <P extends ResourcePath>(
  source: Properties[P],
  sourcePath: P,
  cleanupManager: CleanupManager
): Relations<P> =>
  Object.entries(relationSettings[sourcePath]).reduce(
    (
      otherRelations,
      [relationName, relation]: [string, RelationDefinition<P, ResourcePath>]
    ) => ({
      ...otherRelations,
      [relationName]: createRelation(source, relation, cleanupManager),
    }),
    {} as Relations<P>
  )

const extractRelations = <P extends ResourcePath>(
  properties: FullInstance<P>,
  sourcePath: P
): Relations<P> =>
  Object.keys(relationSettings[sourcePath]).reduce(
    (relations, relationName) => {
      if (relationName in properties == false)
        throw new Error(
          `Falha ao extrair a relacao "${relationName}" de um objeto de path "${sourcePath}"`
        )

      return {
        ...relations,
        [relationName]: properties[relationName as keyof FullInstance<P>],
      }
    },
    {} as Relations<P>
  )

const createRelation = <P extends ResourcePath>(
  source: Properties[P],
  definition: RelationDefinition<P, ResourcePath>,
  cleanupManager: CleanupManager
): Relations<P>[keyof Relations<P>] => ({})

// /** Um construtor generico de relacoes
//  * S para Source, T para Target
//  */
// export abstract class RelationBuilder<
//   S extends ResourceProperties,
//   T extends ResourceProperties
// > {
//   resourcePath: T
//   relationDefinition: { foreignKey: keyof S }

//   getDoc = (id: string) => doc(collection(db, this.resourcePath), id)

//   constructor(
//     resourcePath: T,
//     relationDefinition: { foreignKey: keyof S }
//   ) {
//     this.resourcePath = resourcePath
//     this.relationDefinition = relationDefinition
//   }

//   public abstract build(source: S, cleanupManager: CleanupManager): Relation<T>
// }
