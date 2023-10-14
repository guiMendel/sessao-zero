import { FullInstance, ResourcePath, getFullInstance } from '@/api'
import { DocumentReference, Query } from 'firebase/firestore'
import { Ref, ref } from 'vue'
import { Syncable } from '.'
import { CleanupManager } from '..'

// ===========================
// IMPLEMENTATION
// ===========================

export type SyncableRef<
  P extends ResourcePath,
  M extends Query | DocumentReference
> = Ref<M extends Query ? FullInstance<P>[] : FullInstance<P>> & {
  sync: Syncable<M>
}

/** Cria um ref que automaticamente faz sync com o target
 * @param target O alvo com o qual realizar o sync
 * @param parentCleanupManager Um cleanup manager que, quando ativar o dispose, deve ativar o dispose desse ref tambem
 */
export const syncableRef = <
  P extends ResourcePath,
  M extends Query | DocumentReference
>(
  resourcePath: P,
  target: M | undefined,
  parentCleanupManager: CleanupManager
): SyncableRef<P, M> => {
  const emptyValue =
    target == undefined || target.type === 'document' ? undefined : []

  const valueRef = ref(emptyValue) as M extends Query
    ? Ref<FullInstance<P>[]>
    : Ref<FullInstance<P> | undefined>

  /** O Syncable deste recurso */
  const syncable = new Syncable<M>(target, (snapshot, ownCleanupManager) => {
    let previousValues: FullInstance<P>[]

    // Se forem varios docs
    if ('docs' in snapshot) {
      previousValues = valueRef.value as FullInstance<P>[]

      valueRef.value = getFullInstance(
        snapshot,
        resourcePath,
        ownCleanupManager,
        previousValues
      ) as FullInstance<P>[]

      return
    }

    // Se for so um
    previousValues =
      valueRef.value == undefined ? [] : [valueRef.value as FullInstance<P>]

    valueRef.value = getFullInstance(
      snapshot,
      resourcePath,
      ownCleanupManager,
      previousValues
    )[0]

    // TODO: chamar dispose em todos os valores de previouValues que nao foram reutilizados
  })

  /** O SyncableRef deste recurso */
  const syncedRef = Object.assign(valueRef, {
    sync: syncable,
  }) as unknown as SyncableRef<P, M>

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
