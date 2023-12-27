import { FirevaseClient } from '@/firevase'
import { removeRelation } from '@/firevase/relations'
import {
  ConstrainRelationSettings,
  ManyToManyFrom,
  PathsFrom,
  PropertiesFrom,
} from '@/firevase/types'
import { collection, deleteDoc, doc } from 'firebase/firestore'
import { HalfResource } from '../..'
import { NonHasOneRelations } from '@/firevase/relations/internalTypes'

/** Destroi um recurso para sempre */
export const deleteResource = async <
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

  if (resourceRelations != undefined) {
    await Promise.all(
      Object.entries(resourceRelations).map(async ([relation, definition]) => {
        // Lil' ninja hack
        const source = { id, resourcePath } as HalfResource<C, P>

        // Nothing to do about has-one
        if (definition.type !== 'has-one')
          return removeRelation(
            client,
            source,
            relation as NonHasOneRelations<C, P>,
            'all' as any,
            { force: true }
          )
      })
    )
  }

  // Delete the resource itself
  await deleteDoc(doc(collection(client.db, resourcePath as string), id))
}

// deleteResource(vase, 'guilds', '2')
