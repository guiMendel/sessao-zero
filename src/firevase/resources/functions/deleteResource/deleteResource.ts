import { db } from '@/api/firebase'
import { ResourcePath } from '@/firevase/resources'
import { collection, deleteDoc, doc } from 'firebase/firestore'

/** Destroi um recurso para sempre */
export const deleteResource = <P extends ResourcePath>(
  resourcePath: P,
  id: string
) => deleteDoc(doc(collection(db, resourcePath), id))
