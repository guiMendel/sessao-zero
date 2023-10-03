import { db } from '@/api'
import { ResourcePaths, ResourceProperties } from '@/types'
import { collection, doc } from 'firebase/firestore'
import { SmartRelation } from '.'
import { CleanupManager } from '..'

export interface RelationPrototype {
  _cleanup: Array<() => void>
}

export type Relation<T> = SmartRelation<T>

/** Adiciona a um objeto uma flag que indica se ele nao deve ser descartado */
export type WithDisposeFlag<T> = T & {
  ignoreDispose?: boolean
}

type InjectedRelations<
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
> = {
  [relation in keyof R]: ReturnType<R[relation]['build']>
}

/** Constroi um objeto de relacoes a partir dos builders fornecidos
 * @param source O item para o qual gerar as relacoes
 * @param sourceId O id do item para o qual gerar as relacoes
 * @param builders Conecta o nome das novas relacoes a construir aos seus construtores
 * @param previousValues Um mapa dos ids para os antigos valores de itens do mesmo tipo de source.
 * Utilizado para evitar reconstruir syncs desnecessarios.
 * @param cleanupManager Permite associar qualquer sync criado a um cleanup
 */
export const buildRelations = <
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
>(
  source: P,
  sourceId: string,
  builders: Record<keyof R, RelationBuilder<P, ResourceProperties>>,
  previousValues: Record<string, WithDisposeFlag<P & InjectedRelations<P, R>>>,
  cleanupManager: CleanupManager
): { [relation in keyof R]: ReturnType<R[relation]['build']> } => {
  // Se essa source estiver em previous values, reutiliza as relacoes do previous value
  if (sourceId in previousValues) {
    // Marca para nao descartar esses valores
    previousValues[sourceId].ignoreDispose = true

    return extractRelations<P, R>(
      previousValues[sourceId],
      Object.keys(builders)
    )
  }

  return createRelations<P, R>(source, builders, cleanupManager)
}

const createRelations = <
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
>(
  source: P,
  builders: Record<string, RelationBuilder<P, ResourceProperties>>,
  cleanupManager: CleanupManager
): { [relation in keyof R]: ReturnType<R[relation]['build']> } =>
  Object.entries(builders).reduce(
    (relations, [relationName, builder]) => ({
      ...relations,
      [relationName]: builder.build(source, cleanupManager),
    }),
    {} as { [relation in keyof R]: ReturnType<R[relation]['build']> }
  )

const extractRelations = <
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
>(
  properties: P & InjectedRelations<P, R>,
  relationNames: (keyof R)[]
): { [relation in keyof R]: ReturnType<R[relation]['build']> } =>
  relationNames.reduce(
    (relations, relationName) => ({
      ...relations,
      [relationName]: properties[relationName],
    }),
    {} as { [relation in keyof R]: ReturnType<R[relation]['build']> }
  )

/** Um construtor generico de relacoes
 * S para Source, T para Target
 */
export abstract class RelationBuilder<
  S extends ResourceProperties,
  T extends ResourceProperties
> {
  resourcePath: ResourcePaths
  relationDefinition: { foreignKey: keyof S }

  getDoc = (id: string) => doc(collection(db, this.resourcePath), id)

  constructor(
    resourcePath: ResourcePaths,
    relationDefinition: { foreignKey: keyof S }
  ) {
    this.resourcePath = resourcePath
    this.relationDefinition = relationDefinition
  }

  public abstract build(source: S, cleanupManager: CleanupManager): Relation<T>
}
