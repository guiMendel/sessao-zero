import {
  FullInstance,
  Properties,
  RelationDefinition,
  Relations,
  ResourcePath,
  Syncable,
  db,
  relationSettings,
  syncableRef,
} from '@/api/'
import { Resource } from '@/api/resources/types'
import { CleanupManager } from '@/utils'
import { Query, collection, doc, query, where } from 'firebase/firestore'

/** Adiciona a um objeto uma flag que indica se ele nao deve ser descartado */
export type WithDisposeFlag<T> = T & {
  dontDispose?: boolean
}

type BuildRelationsParams<P extends ResourcePath> = {
  /** O item para o qual gerar as relacoes */
  source: Resource<Properties[P]>
  /** O path do recurso para o qual gerar as relacoes */
  sourcePath: P
  /** Um mapa dos ids para os antigos valores de itens do mesmo tipo de source.
   * Utilizado para evitar reconstruir syncs desnecessarios */
  previousValues: Record<string, WithDisposeFlag<FullInstance<P>>>
  /** Permite associar qualquer sync criado a um cleanup */
  cleanupManager: CleanupManager
}

/** Constroi um objeto de relacoes para a instancia fornecida */
export const buildRelations = <P extends ResourcePath>({
  cleanupManager,
  previousValues,
  source,
  sourcePath,
}: BuildRelationsParams<P>): Relations<P> => {
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
      [relationName]: createRelation(
        source,
        sourcePath,
        relation,
        cleanupManager
      ),
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
  sourcePath: P,
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

    case 'many-to-many':
      return createManyToManyRelation(
        source,
        sourcePath,
        definition as RelationDefinition<P, ResourcePath, 'many-to-many'>,
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

  const targetDoc = doc(collection(db, definition.targetResourcePath), targetId)

  return syncableRef(definition.targetResourcePath, targetDoc, cleanupManager)
}

/** Relation key refers to a property of target */
const createHasManyRelation = <P extends ResourcePath>(
  source: Resource<Properties[P]>,
  definition: RelationDefinition<P, ResourcePath, 'has-many'>,
  cleanupManager: CleanupManager
) => {
  const targetQuery = query(
    collection(db, definition.targetResourcePath),
    where(definition.relationKey as string, '==', source.id)
  )

  return syncableRef(definition.targetResourcePath, targetQuery, cleanupManager)
}

/** Relation key refers to a property of target */
const createManyToManyRelation = <P extends ResourcePath>(
  source: Resource<Properties[P]>,
  sourcePath: P,
  definition: RelationDefinition<P, ResourcePath, 'many-to-many'>,
  cleanupManager: CleanupManager
) => {
  // Essa query encontra os ids dos alvos mapeados a esse source
  const bridgeQuery = query(
    collection(db, definition.manyToManyTable),
    where(sourcePath, '==', source.id)
  )

  // Syncamos a essa query
  const bridgeSync = new Syncable(bridgeQuery, (snapshot) => {
    if (snapshot.empty) {
      // Remove o target
      targets.sync.updateTarget(undefined)
      return
    }

    const targetIds = snapshot.docs.map(
      (doc) => doc.data()[definition.targetResourcePath]
    )

    // A query que retorna os alvos de fato
    const targetsQuery = query(
      collection(db, definition.targetResourcePath),
      where('id', 'in', targetIds)
    )

    // Atualiza o query dos targets
    targets.sync.updateTarget(targetsQuery)
  })

  // Criamos o syncable ref com a query dos alvos
  const targets = syncableRef<typeof definition.targetResourcePath, Query>(
    definition.targetResourcePath,
    'empty-query',
    cleanupManager
  )

  // Associamos o cleanup do syncableRef ao bridgeSync
  targets.sync
    .getCleanupManager()
    .link('propagate-both', bridgeSync.getCleanupManager())

  return targets
}
