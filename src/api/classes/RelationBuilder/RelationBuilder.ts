import { ResourcePaths, ResourceProperties } from '@/types'
import { SmartRelation } from '.'
import { CleanupManager } from '..'

export interface RelationPrototype {
  _cleanup: Array<() => void>
}

export type Relation<T> = SmartRelation<T>

/** Constroi um objeto de relacoes a partir dos builders fornecidos */
export const buildRelations = <
  P extends ResourceProperties,
  R extends Record<string, RelationBuilder<P, ResourceProperties>>
>(
  source: P,
  builders: Record<
    string,
    RelationBuilder<ResourceProperties, ResourceProperties>
  >,
  cleanupManager: CleanupManager
): { [relation in keyof R]: ReturnType<R[relation]['build']> } =>
  Object.entries(builders).reduce(
    (relations, [relationName, builder]) => ({
      ...relations,
      [relationName]: builder.build(source, cleanupManager),
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

  constructor(
    resourcePath: ResourcePaths,
    relationDefinition: { foreignKey: keyof S }
  ) {
    this.resourcePath = resourcePath
    this.relationDefinition = relationDefinition
  }

  public abstract build(source: S, cleanupManager: CleanupManager): Relation<T>
}
