import {
  CleanupManager,
  SyncableRef,
  snapshotToResources as originalSnapshotToResource,
  syncableRef,
} from '@/api'
import {
  PropertyExtractor,
  propertyExtractors,
} from '@/api/constants/propertyExtractors'
import { Resource, ResourceProperties } from '@/types'
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { RelationBuilder } from '..'

export type SmartRelation<T> = SyncableRef<T, DocumentReference>

export class SmartRelationBuilder<
  S extends ResourceProperties,
  T extends ResourceProperties
> extends RelationBuilder<S, T> {
  public build(source: S, cleanupManager: CleanupManager): SmartRelation<T> {
    /** Extrai o recurso de um snapshot */
    const snapshotToResources = (
      doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
    ): Resource<T>[] =>
      originalSnapshotToResource<T>(doc, {
        extractProperties: propertyExtractors[
          this.resourcePath
        ] as PropertyExtractor<T>,
      })

    const targetId = source[this.relationDefinition.foreignKey]

    /** A referencia que sera sincronizada */
    const resource = syncableRef<T, DocumentReference>(
      this.getDoc(targetId as string),
      snapshotToResources,
      cleanupManager
    )

    return resource
  }
}
