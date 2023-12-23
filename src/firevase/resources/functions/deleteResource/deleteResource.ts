import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { collection, deleteDoc, doc } from 'firebase/firestore'

/** Destroi um recurso para sempre */
export const deleteResource = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P,
  id: string
) => deleteDoc(doc(collection(client.db, resourcePath as string), id))

// deleteResource(vase, 'guilds', '2')
