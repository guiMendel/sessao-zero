import { Resource, ResourceProperties } from '@/types'
import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
} from 'firebase/firestore'
import { Ref, ref } from 'vue'
import { Syncable } from '.'
import { CleanupManager } from '..'

// ===========================
// IMPLEMENTATION
// ===========================

export type SyncableRef<T, M extends Query | DocumentReference> = Ref<
  M extends Query ? Resource<T>[] : Resource<T>
> &
  Syncable<M>

/** Cria um ref que automaticamente faz sync com o target
 * @param target O alvo com o qual realizar o sync
 * @param snapshotToResources Como transformar o snapshot recebido pelo sync em um(varios) recurso(s)
 * @param parentCleanupManager Um cleanup manager que, quando ativar o dispose, deve ativar o dispose desse ref tambem
 */
export const syncableRef = <
  T extends ResourceProperties,
  M extends Query | DocumentReference
>(
  target: M | undefined,
  snapshotToResources: (
    content: M extends Query ? QuerySnapshot : DocumentSnapshot,
    previousValues: Resource<T>[]
  ) => Resource<T>[],
  parentCleanupManager?: CleanupManager
): SyncableRef<T | undefined, M> => {
  const emptyValue =
    target == undefined || target.type === 'document' ? null : []

  const valueRef = ref(emptyValue) as M extends Query
    ? Ref<Resource<T>[]>
    : Ref<Resource<T> | null>

  /** O Syncable deste recurso */
  const syncable = new Syncable<M>(target, (snapshot) => {
    // Se forem varios docs
    if ('docs' in snapshot) {
      valueRef.value = snapshotToResources(
        snapshot,
        valueRef.value as Resource<T>[]
      )

      return
    }

    // Se for so um
    valueRef.value = snapshotToResources(
      snapshot,
      valueRef.value == null ? [] : [valueRef.value as Resource<T>]
    )[0]
  }) as SyncableRef<T, M>

  /** O SyncableRef deste recurso */
  const syncedRef = Object.assign(valueRef, syncable)

  // Pega os metodos
  syncedRef.onReset = syncable.onReset
  syncedRef.reset = syncable.reset
  syncedRef.triggerSync = syncable.triggerSync
  syncedRef.updateTarget = syncable.updateTarget
  syncedRef.getTarget = syncable.getTarget
  syncedRef.getCleanupManager = syncable.getCleanupManager

  syncedRef.onReset(() => (valueRef.value = emptyValue))

  // Associa o cleanup manager
  parentCleanupManager?.link(
    syncedRef.getCleanupManager(),
    'propagate-to-other'
  )

  return new Proxy(syncedRef, {
    get: (currentState, property) => {
      if (property === 'value') currentState.triggerSync()

      return currentState[property as keyof typeof currentState]
    },
  })
}
