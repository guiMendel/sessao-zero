import { FirevaseClient } from '@/firevase'
import { forceRemoveRelation } from '@/firevase/relations'
import { NonHasOneRelations } from '@/firevase/relations/internalTypes'
import { HalfResource } from '@/firevase/resources'
import {
  ConstrainRelationSettings,
  ManyToManyFrom,
  PathsFrom,
  PropertiesFrom,
} from '@/firevase/types'

export const deleteResourceRelations = async <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P,
  id: string
) => {
  // Delete relation references
  const resourceRelations = client.relationSettings?.[resourcePath] as
    | undefined
    | ConstrainRelationSettings<PropertiesFrom<C>, ManyToManyFrom<C>>[P]

  if (resourceRelations == undefined) return

  return Promise.all(
    Object.entries(resourceRelations).map(async ([relation, definition]) => {
      // Lil' ninja hack
      const source = { id, resourcePath } as HalfResource<C, P>

      // Nothing to do about has-one
      if (definition.type !== 'has-one')
        return forceRemoveRelation(
          client,
          source,
          relation as NonHasOneRelations<C, P>,
          'all'
        )
    })
  )
}
