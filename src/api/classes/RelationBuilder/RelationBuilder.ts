import { ResourceType } from '@/types'
import { SmartRelation } from '.'

export type Relation<T> = SmartRelation<T>

/** Constroi um objeto de relacoes a partir dos builders fornecidos */
export const buildRelations = (
  builders: Record<string, RelationBuilder<unknown, unknown>>
): Record<string, Relation<unknown>> =>
  Object.entries(builders).reduce(
    (relations, [relationName, builder]) => ({
      ...relations,
      [relationName]: builder.build(),
    }),
    {} as Record<string, Relation<unknown>>
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
