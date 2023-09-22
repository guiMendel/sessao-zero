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
    inject: I
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
    inject?: I
  }
) {
  const documentData = doc.data()

  if (documentData == undefined) return null

  return {
    ...options.inject,
    // Adiciona as propriedades
    ...options.extractProperties(doc.id, documentData),
    id: doc.id,
    createdAt: new Date(documentData.createdAt),
    modifiedAt: new Date(documentData.modifiedAt),
  }
}

export { snapshotToResource }
