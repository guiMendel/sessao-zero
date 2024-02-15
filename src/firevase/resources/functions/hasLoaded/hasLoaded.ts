import { FirevaseClient } from '@/firevase'
import { SyncableRef } from '@/firevase/classes/Syncable'
import { Relations } from '@/firevase/relations'
import { PathsFrom } from '@/firevase/types'
import { toRaw, toValue } from 'vue'
import { Resource } from '../..'

type RefWithRelation<C extends FirevaseClient> = {
  [P in PathsFrom<C>]: [
    SyncableRef<C, P, any> | Resource<C, P>,
    keyof Relations<C, P>
  ]
}[PathsFrom<C>]

type Argument<C extends FirevaseClient> =
  | SyncableRef<C, PathsFrom<C>, any>
  | RefWithRelation<C>
  | undefined

export const hasLoaded = <C extends FirevaseClient>(...args: Argument<C>[]) => {
  // We don't want to return early since that would keep the function from generating vue
  // dependencies for all variables and relations
  let result = true

  for (const arg of args) {
    if (!arg) continue

    // Address no relation
    if (!Array.isArray(arg)) {
      // Generate vue dependency
      toValue(arg)

      if (arg.sync.hasLoaded === false) result = false
      continue
    }

    const [ref, relation] = arg

    if ('sync' in ref && ref.sync.hasLoaded === false) result = false

    const value = toValue(ref)

    if (value == undefined) continue

    // Address document ref
    if (!Array.isArray(value)) {
      // Access relation to generate vue dependency
      toValue(value[relation as keyof typeof value])

      const relationSync = toRaw(value)[relation as keyof typeof value].sync

      if (relationSync.hasLoaded === false) result = false
      continue
    }

    // Access relations to generate vue dependencies
    value.forEach((instance) => toValue(instance[relation]))

    if (!value.every((instance) => toRaw(instance)[relation].sync.hasLoaded))
      result = false
  }

  return result
}
