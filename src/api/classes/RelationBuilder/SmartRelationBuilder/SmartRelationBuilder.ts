import { Resource } from '@/types'
import { Ref, ref } from 'vue'
import { RelationBuilder } from '..'

export type SmartRelation<T> = Ref<Resource<T> | undefined> & {
  triggerSync: () => void
}

export class SmartRelationBuilder<S, T> extends RelationBuilder<S, T> {
  /** Destroi o sync desta relacao */
  public unsubscribe = () => {}

  public build(): SmartRelation<T> {
    /** A referencia que sera sincronizada */
    const resource = ref<Resource<T> | undefined>(undefined) as Ref<
      Resource<T> | undefined
    >

    /** Inicia a sincronizacao */
    const triggerSync = () => {
      resource.value = {} as Resource<T>

      // Guarda o desync
      this.unsubscribe = () => console.log('unsubscribe')
    }

    return new Proxy(
      { ...resource, triggerSync },
      {
        get: (currentState, property) => {
          if (property === 'value') triggerSync()

          return currentState[property as keyof typeof currentState]
        },
      }
    )
  }
}
