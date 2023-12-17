import { db } from '@/api/firebase'
import { Properties, ResourcePath, Uploadable } from '@/api/resources'
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'
import { secureData } from '../'

/** Cria um novo recurso */
export const createResource = async <P extends ResourcePath>(
  resourcePath: P,
  properties: Properties[P],
  useId?: string
) => {
  /** A collection deste recurso */
  const resourceCollection = collection(db, resourcePath)

  const securedData = {
    ...secureData(properties),
    createdAt: new Date().toJSON(),
    modifiedAt: new Date().toJSON(),
  } as Uploadable<P>

  // Overwrite
  if (useId != undefined) {
    const document = doc(resourceCollection, useId)

    await setDoc(document, securedData)

    return document
  }

  return addDoc(resourceCollection, securedData)
}
