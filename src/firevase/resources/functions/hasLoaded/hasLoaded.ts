import { FirevaseClient } from '@/firevase'
import { SyncableRef } from '@/firevase/Syncable'
import { Relations } from '@/firevase/relations'
import { PathsFrom } from '@/firevase/types'
import { toRaw, toValue } from 'vue'

type RefWithRelation<C extends FirevaseClient> = {
  [P in PathsFrom<C>]: [SyncableRef<C, P, any>, keyof Relations<C, P>]
}[PathsFrom<C>]

type Argument<C extends FirevaseClient> =
  | SyncableRef<C, PathsFrom<C>, any>
  | RefWithRelation<C>

export const hasLoaded = <C extends FirevaseClient>(...args: Argument<C>[]) => {
  // We don't want to return early since that would kepe the funciton from generating vue
  // dependencies for all variables and relations
  let result = true

  for (const arg of args) {
    // Address no relation
    if (!Array.isArray(arg)) {
      if (arg.sync.hasLoaded === false) result = false
      continue
    }

    const [ref, relation] = arg

    if (ref.sync.hasLoaded === false) result = false

    if (ref.value == undefined) continue

    // Address document ref
    if (!Array.isArray(ref.value)) {
      // Access relation to generate vue dependency
      toValue(ref.value[relation as keyof typeof ref.value])

      const relationSync = toRaw(ref.value)[relation as keyof typeof ref.value]
        .sync

      if (relationSync.hasLoaded === false) result = false
      continue
    }

    // Access relations to generate vue dependencies
    ref.value.forEach((instance) => toValue(instance[relation]))

    if (
      !ref.value.every((instance) => toRaw(instance)[relation].sync.hasLoaded)
    )
      result = false
  }

  return result
}
