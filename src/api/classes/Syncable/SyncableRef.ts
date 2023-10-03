import { Resource, ResourceProperties } from '@/types'
import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
} from 'firebase/firestore'
import { Ref, ref } from 'vue'
import { Syncable } from '.'

// ===========================
// IMPLEMENTATION
// ===========================

export type SyncableRef<T, M extends Query | DocumentReference> = Ref<
  M extends Query ? Resource<T>[] : Resource<T>
> &
  Syncable<M>

export const syncableRef = <
  T extends ResourceProperties,
  M extends Query | DocumentReference
>(
  target: M | undefined,
  snapshotToResources: (
    content: M extends Query ? QuerySnapshot : DocumentSnapshot,
    previousValues: Resource<T>[]
  ) => Resource<T>[]
): SyncableRef<T, M> => {
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
    valueRef.value = snapshotToResources(snapshot, [
      valueRef.value as Resource<T>,
    ])[0]
  }) as SyncableRef<T, M>

  /** O SyncableRef deste recurso */
  const syncedRef = Object.assign(valueRef, syncable)

  // Pega os metodos
  syncedRef.onReset = syncable.onReset
  syncedRef.reset = syncable.reset
  syncedRef.triggerSync = syncable.triggerSync
  syncedRef.updateTarget = syncable.updateTarget

  console.log({ syncable })

  syncedRef.onReset(() => (valueRef.value = emptyValue))

  return new Proxy(syncedRef, {
    get: (currentState, property) => {
      if (property === 'value') currentState.triggerSync()

      return currentState[property as keyof typeof currentState]
    },
  })
}
