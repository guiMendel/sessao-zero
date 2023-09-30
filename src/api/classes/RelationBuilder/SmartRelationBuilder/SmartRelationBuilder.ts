import { Resource, ResourceProperties } from '@/types'
import { Ref, ref, watch } from 'vue'
import { RelationBuilder, RelationPrototype } from '..'
import {
  CleanupManager,
  getResourceSynchronizer,
  snapshotToResource as originalSnapshotToResource,
} from '@/api'
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  PropertyExtractor,
  propertyExtractors,
} from '@/api/constants/propertyExtractors'

export type SmartRelation<T> = RelationPrototype &
  Ref<Resource<T> | null> & {
    triggerSync: () => void
  }

export class SmartRelationBuilder<
  S extends ResourceProperties,
  T extends ResourceProperties
> extends RelationBuilder<S, T> {
  public build(source: S, cleanupManager: CleanupManager): SmartRelation<T> {
    /** A referencia que sera sincronizada */
    const resource = ref<Resource<T> | null>(null) as SmartRelation<T>

    /** Indica o estado da relacao */
    let state: 'empty' | 'synced' | 'disposed' = 'empty'

    /** Destroi o sync desta relacao */
    let unsubscribe = () => {}

    /** Extrai o recurso de um snapshot */
    const snapshotToResource = (
      doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
    ): Resource<T> | null =>
      originalSnapshotToResource(doc, {
        extractProperties: propertyExtractors[
          this.resourcePath
        ] as PropertyExtractor<T>,
      })

    const { desync, sync } = getResourceSynchronizer(this.resourcePath, {
      snapshotToResource,
    })

    /** Inicia a sincronizacao */
    const triggerSync = () => {
      if (state === 'synced') return
      if (state === 'disposed')
        throw new Error('Tentativa de syncar uma relacao que ja foi destruida')

      state = 'synced'

      // Pega a foreign key
      const targetId = source[this.relationDefinition.foreignKey] as string

      sync(targetId, resource)

      // Guarda o desync
      unsubscribe = cleanupManager.add(() => {
        if (state === 'disposed') return
        state = 'disposed'

        desync('all')

        console.log('unsubscribe')
      })
    }

    resource.triggerSync = triggerSync
    resource._cleanup = [unsubscribe]

    return new Proxy(resource, {
      get: (currentState, property) => {
        if (property === 'value') triggerSync()

        return currentState[property as keyof typeof currentState]
      },
    })
  }
}
