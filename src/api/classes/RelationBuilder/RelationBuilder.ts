import { ResourceType } from '@/types'
import { SmartRelation } from '.'

export type Relation<T> = SmartRelation<T>

/** Constroi um objeto de relacoes a partir dos builders fornecidos */
export const buildRelations = <
  P extends Record<string, any>,
  R extends Record<string, RelationBuilder<P, unknown>>
>(
  builders: Record<string, RelationBuilder<unknown, unknown>>
): { [relation in keyof R]: ReturnType<R[relation]['build']> } =>
  Object.entries(builders).reduce(
    (relations, [relationName, builder]) => ({
      ...relations,
      [relationName]: builder.build(),
    }),
    {} as { [relation in keyof R]: ReturnType<R[relation]['build']> }
  )

/** Um construtor generico de relacoes */
export abstract class RelationBuilder<S, T> {
  resourcePath: ResourceType
  relationDefinition: { foreignKey: keyof S }

  constructor(
    resourcePath: ResourceType,
    relationDefinition: { foreignKey: keyof S }
  ) {
    this.resourcePath = resourcePath
    this.relationDefinition = relationDefinition
  }

  public abstract build(): Relation<T>
}
