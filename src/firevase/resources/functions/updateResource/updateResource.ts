import { Properties, ResourcePath } from '@/firevase/resources'
import { secureData } from '../write'
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/api/firebase'

export const updateResource = <P extends ResourcePath>(
  resourcePath: P,
  id: string,
  properties: Partial<Properties[P]>,
  { overwrite } = { overwrite: false }
) => {
  const securedData = {
    ...secureData(properties, 'id'),
    modifiedAt: new Date().toJSON(),
  }

  const document = doc(collection(db, resourcePath), id)

  if (overwrite) return setDoc(document, securedData)

  return updateDoc(document, securedData)
}
