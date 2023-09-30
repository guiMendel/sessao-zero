import { PropertyExtractor } from '@/api/constants/propertyExtractors'
import { Resource, ResourceProperties } from '@/types'
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'

function snapshotToResource<P extends ResourceProperties>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: PropertyExtractor<P>
  }
): Resource<P> | null

function snapshotToResource<
  P extends ResourceProperties,
  I extends Record<string, any>
>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: PropertyExtractor<P>
    inject: (properties: P) => I
  }
): Resource<P & I> | null

/** Extrai o recurso de um snapshot */
function snapshotToResource<
  P extends ResourceProperties,
  I extends Record<string, any>
>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: PropertyExtractor<P>
    inject?: (properties: P) => I
  }
) {
  const documentData = doc.data()

  if (documentData == undefined) return null

  const properties = {
    // Adiciona as propriedades
    ...options.extractProperties(doc.id, documentData),
    id: doc.id,
    createdAt: new Date(documentData.createdAt),
    modifiedAt: new Date(documentData.modifiedAt),
  }

  if (options.inject)
    return {
      ...options.inject(properties),
      ...properties,
    }

  return properties
}

export { snapshotToResource }
