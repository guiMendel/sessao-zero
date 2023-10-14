import {
  CleanupManager,
  FullInstance,
  Properties,
  RelationDefinition,
  Relations,
  ResourcePath,
  db,
  relationSettings,
  syncableRef,
} from '@/api/'
import { Resource } from '@/types'
import { collection, doc, query, where } from 'firebase/firestore'

/** Adiciona a um objeto uma flag que indica se ele nao deve ser descartado */
export type WithDisposeFlag<T> = T & {
  dontDispose?: boolean
}

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
    previousValues[source.id].dontDispose = true

    return extractRelations(previousValues[source.id], sourcePath)
  }

  return createRelations(source, sourcePath, cleanupManager)
}

const createRelations = <P extends ResourcePath>(
  source: Resource<Properties[P]>,
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
  source: Resource<Properties[P]>,
  definition: RelationDefinition<P, ResourcePath>,
  cleanupManager: CleanupManager
) => {
  switch (definition.type) {
    case 'has-many':
      return createHasManyRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-many'>,
        cleanupManager
      )

    case 'has-one':
      return createHasOneRelation(
        source,
        definition as RelationDefinition<P, ResourcePath, 'has-one'>,
        cleanupManager
      )
  }
}

/** Relation key refers to a property of source */
const createHasOneRelation = <P extends ResourcePath>(
  source: Resource<Properties[P]>,
  definition: RelationDefinition<P, ResourcePath, 'has-one'>,
  cleanupManager: CleanupManager
) => {
  const targetId = source[definition.relationKey] as string

  const targetDoc = doc(collection(db, definition.resourcePath), targetId)

  return syncableRef(definition.resourcePath, targetDoc, cleanupManager)
}

/** Relation key refers to a property of target */
const createHasManyRelation = <P extends ResourcePath>(
  source: Resource<Properties[P]>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  cleanupManager: CleanupManager
) => {
  const targetQuery = query(
    collection(db, definition.resourcePath),
    where(definition.relationKey as string, '==', source.id)
  )

  return syncableRef(definition.resourcePath, targetQuery, cleanupManager)
}
