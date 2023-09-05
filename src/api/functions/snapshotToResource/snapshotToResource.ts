import { Resource } from '@/types'
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'

function snapshotToResource<P extends Record<string, any>>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: (id: string, documentData: DocumentData) => P
  }
): Resource<P> | null

function snapshotToResource<
  P extends Record<string, any>,
  I extends Record<string, any>
>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: (id: string, documentData: DocumentData) => P
    inject: I
  }
): Resource<P & I> | null

/** Extrai o recurso de um snapshot */
function snapshotToResource<
  P extends Record<string, any>,
  I extends Record<string, any>
>(
  doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  options: {
    extractProperties: (id: string, documentData: DocumentData) => P
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
