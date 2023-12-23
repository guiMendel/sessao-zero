import { makeResource } from '@/firevase/resources/functions/makeResource'
import { CleanupManager } from '@/utils/classes'
import { DocumentReference, Query } from 'firebase/firestore'
import { Ref, ref } from 'vue'
import { FirevaseClient } from '..'
import { Resource } from '../resources'
import { PathsFrom } from '../types'
import { Syncable } from './Syncable'

// ===========================
// IMPLEMENTATION
// ===========================

export type SyncableRef<
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  M extends Query | DocumentReference
> = Ref<M extends Query ? Resource<C, P>[] : Resource<C, P>> & {
  sync: Syncable<M>
}

export const isQueryTarget = (
  target: Query | DocumentReference | 'empty-document' | 'empty-query'
): target is Query | 'empty-query' =>
  target === 'empty-query' ||
  (typeof target === 'object' && target.type === 'query')

/** Cria um ref que automaticamente faz sync com o target
 * @param target O alvo com o qual realizar o sync
 * @param parentCleanupManager Um cleanup manager que, quando ativar o dispose, deve ativar o dispose desse ref tambem
 */
export const syncableRef = <
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  M extends Query | DocumentReference
>(
  client: C,
  resourcePath: P,
  target: M | 'empty-document' | 'empty-query',
  parentCleanupManager: CleanupManager
): SyncableRef<C, P, M> => {
  const emptyValue = isQueryTarget(target)
    ? ([] as Resource<C, P>[])
    : undefined

  const valueRef = ref(emptyValue) as M extends Query
    ? Ref<Resource<C, P>[]>
    : Ref<Resource<C, P> | undefined>

  const initialTarget =
    target === 'empty-document' || target === 'empty-query' ? undefined : target

  /** O Syncable deste recurso */
  const syncable = new Syncable<M>(
    initialTarget,
    (snapshot, ownCleanupManager) => {
      let previousValues: Resource<C, P>[]

      // Se forem varios docs
      if ('docs' in snapshot) {
        previousValues = valueRef.value as Resource<C, P>[]

        valueRef.value = makeResource(
          client,
          snapshot,
          resourcePath,
          ownCleanupManager,
          previousValues
        ) as Resource<C, P>[]

        return
      }

      // Se for so um
      previousValues =
        valueRef.value == undefined ? [] : [valueRef.value as Resource<C, P>]

      valueRef.value = makeResource(
        client,
        snapshot,
        resourcePath,
        ownCleanupManager,
        previousValues
      )[0]

      // TODO: chamar dispose em todos os valores de previouValues que nao foram reutilizados
    }
  )

  /** O SyncableRef deste recurso */
  const syncedRef = Object.assign(valueRef, {
    sync: syncable,
  }) as unknown as SyncableRef<C, P, M>

  syncedRef.sync.onReset(() => (valueRef.value = emptyValue))

  // Associa o cleanup manager
  parentCleanupManager.link('propagate-to', syncedRef.sync.getCleanupManager())

  return new Proxy(syncedRef, {
    get: (currentState, property) => {
      if (property === 'value') currentState.sync.triggerSync()

      return currentState[property as keyof typeof currentState]
    },
  })
}
