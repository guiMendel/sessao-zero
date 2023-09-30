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
// HELPERS
// ===========================

// type GetTarget<T> = T extends Array<ResourceProperties>
//   ? Query
//   : DocumentReference

// type GetResourceProperties<T> = T extends Array<ResourceProperties>
//   ? T[number]
//   : T

// type GetRefType<T> = GetTarget<T> extends Query
//   ? Ref<Resource<GetResourceProperties<T>>[]>
//   : Ref<Resource<GetResourceProperties<T>> | null>

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
  target: M,
  snapshotToResources: (
    content: M extends Query ? QuerySnapshot : DocumentSnapshot,
    previousValues: Resource<T>[]
  ) => Resource<T>[]
): SyncableRef<T, M> => {
  const valueRef = ref(
    target.type === 'document' ? null : []
  ) as M extends Query ? Ref<Resource<T>[]> : Ref<Resource<T> | null>

  return Object.assign(
    valueRef,
    new Syncable<M>(target, (snapshot) => {
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
  )
}
