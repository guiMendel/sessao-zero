import { FirevaseClient } from '@/firevase'
import { Syncable } from '@/firevase/Syncable/Syncable'
import { syncableRef } from '@/firevase/Syncable/SyncableRef'
import type { HalfResource, Resource } from '@/firevase/resources/types'
import { PathsFrom } from '@/firevase/types'
import { CleanupManager } from '@/utils/classes'
import {
  Query,
  collection,
  doc,
  documentId,
  query,
  where,
} from 'firebase/firestore'
import { RelationDefinitionFrom, RelationsRefs } from '..'

/** Adiciona a um objeto uma flag que indica se ele nao deve ser descartado */
export type WithDisposeFlag<T> = T & {
  dontDispose?: boolean
}

type BuildRelationsParams<C extends FirevaseClient, P extends PathsFrom<C>> = {
  /** Client where to get relation definitions */
  client: C
  /** O item para o qual gerar as relacoes */
  source: HalfResource<C, P>
  /** Um mapa dos ids para os antigos valores de itens do mesmo tipo de source.
   * Utilizado para evitar reconstruir syncs desnecessarios */
  previousValues: Record<string, WithDisposeFlag<Resource<C, P>>>
  /** Permite associar qualquer sync criado a um cleanup */
  cleanupManager: CleanupManager
}

/** Constroi um objeto de relacoes para a instancia fornecida */
export const buildRelations = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>({
  cleanupManager,
  previousValues,
  source,
  client,
}: BuildRelationsParams<C, P>): RelationsRefs<C, P> => {
  if (client.relationSettings == undefined)
    throw new Error(
      `Impossible to build relations for ${source.resourcePath} — client has no relation settings`
    )

  // Se essa source estiver em previous values, reutiliza as relacoes do previous value
  if (source.id in previousValues) {
    // Marca para nao descartar esses valores
    previousValues[source.id].dontDispose = true

    return extractRelations(client, previousValues[source.id])
  }

  return createRelations(client, source, cleanupManager)
}

const createRelations = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  source: HalfResource<C, P>,
  cleanupManager: CleanupManager
): RelationsRefs<C, P> =>
  Object.entries(client.relationSettings[source.resourcePath]).reduce(
    (otherRelations, [relationName, relation]: [string, any]) => ({
      ...otherRelations,
      [relationName]: createRelation(client, source, relation, cleanupManager),
    }),
    {} as RelationsRefs<C, P>
  )

const extractRelations = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  instance: Resource<C, P>
): RelationsRefs<C, P> =>
  Object.keys(client.relationSettings[instance.resourcePath]).reduce(
    (relations, relationName) => {
      if (relationName in instance == false)
        throw new Error(
          `Falha ao extrair a relacao "${relationName}" de um objeto de path "${instance.resourcePath}"`
        )

      return {
        ...relations,
        [relationName]: instance[relationName as keyof Resource<C, P>],
      }
    },
    {} as RelationsRefs<C, P>
  )

const createRelation = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>>,
  cleanupManager: CleanupManager
) => {
  switch (definition.type) {
    case 'has-one':
      return createHasOneRelation(
        client,
        source,
        definition as RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-one'>,
        cleanupManager
      )

    case 'has-many':
      return createHasManyRelation(
        client,
        source,
        definition as RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-many'>,
        cleanupManager
      )

    case 'many-to-many':
      return createManyToManyRelation(
        client,
        source,
        definition as RelationDefinitionFrom<
          C,
          P,
          PathsFrom<C>,
          'many-to-many'
        >,
        cleanupManager
      )

    // Exhaustiveness checking: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
    default:
      const exhaustiveCheck: never = definition.type
      return exhaustiveCheck
  }
}

/** Relation key refers to a property of source */
const createHasOneRelation = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-one'>,
  cleanupManager: CleanupManager
) => {
  const targetId = source[definition.relationKey] as string

  const targetDoc = doc(
    collection(client.db, definition.targetResourcePath as string),
    targetId
  )

  return syncableRef(
    client,
    definition.targetResourcePath,
    targetDoc,
    cleanupManager
  )
}

/** Relation key refers to a property of target */
const createHasManyRelation = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'has-many'>,
  cleanupManager: CleanupManager
) => {
  const targetQuery = query(
    collection(client.db, definition.targetResourcePath as string),
    where(definition.relationKey as string, '==', source.id)
  )

  return syncableRef(
    client,
    definition.targetResourcePath,
    targetQuery,
    cleanupManager
  )
}

/** Relation key refers to a property of target */
const createManyToManyRelation = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  source: HalfResource<C, P>,
  definition: RelationDefinitionFrom<C, P, PathsFrom<C>, 'many-to-many'>,
  cleanupManager: CleanupManager
) => {
  // Essa query encontra os ids dos alvos mapeados a esse source
  const bridgeQuery = query(
    collection(client.db, definition.manyToManyTable as string),
    where(source.resourcePath, '==', source.id)
  )

  // Syncamos a essa query
  const bridgeSync = new Syncable(bridgeQuery, (snapshot) => {
    if (snapshot.empty) {
      // Remove o target
      targets.sync.updateTarget(undefined)
      return
    }

    const targetIds = snapshot.docs.map(
      (doc) => doc.data()[definition.targetResourcePath as string]
    )

    // A query que retorna os alvos de fato
    const targetsQuery = query(
      collection(client.db, definition.targetResourcePath as string),
      where(documentId(), 'in', targetIds)
    )

    // Atualiza o query dos targets
    targets.sync.updateTarget(targetsQuery)
  })

  // Criamos o syncable ref com a query dos alvos
  const targets = syncableRef<C, typeof definition.targetResourcePath, Query>(
    client,
    definition.targetResourcePath,
    'empty-query',
    cleanupManager
  )

  // Quando o target receber trigger, damos trigger no bridge
  targets.sync.onBeforeSyncTrigger(() => bridgeSync.triggerSync())

  // Associamos o cleanup do syncableRef ao bridgeSync
  targets.sync
    .getCleanupManager()
    .link('propagate-both', bridgeSync.getCleanupManager())

  return targets
}

// const playerRelations = buildRelations({
//   cleanupManager: new CleanupManager(),
//   client: vase,
//   previousValues: {},
//   source: syncableRef<Vase, 'players', DocumentReference>(
//     'players',
//     'empty-document',
//     new CleanupManager()
//   ).value,
// })

// playerRelations.guilds.value.at(0)?.owner
