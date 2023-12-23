import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { CleanupManager } from '@/utils/classes'
import {
  QueryFieldFilterConstraint,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
} from 'firebase/firestore'
import { HalfResource, Resource, makeHalfResource, makeResource } from '../..'

// ====================================
// TIPOS DO RETURN
// ====================================

export type GetListMethod<
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  L extends Resource<C, P>[] | HalfResource<C, P>[]
> = (filters?: QueryFieldFilterConstraint[]) => Promise<L>

export type GetMethod<
  C extends FirevaseClient,
  P extends PathsFrom<C>,
  L extends Resource<C, P> | HalfResource<C, P>
> = (id: string) => Promise<L | undefined>

// ====================================
// IMPLEMENTACAO
// ====================================

/** Permite acesso a um recurso, sem injetar relacoes */
export function getResourceGetter<
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P
): {
  get: GetMethod<C, P, HalfResource<C, P>>
  getList: GetListMethod<C, P, HalfResource<C, P>[]>
}

/** Permite acesso a um recurso e injeta relacoes */
export function getResourceGetter<
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P,
  cleanupManager: CleanupManager
): {
  get: GetMethod<C, P, Resource<C, P>>
  getList: GetListMethod<C, P, Resource<C, P>[]>
}

export function getResourceGetter<
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  resourcePath: P,
  cleanupManager?: CleanupManager
): {
  get: GetMethod<C, P, HalfResource<C, P> | Resource<C, P>>
  getList: GetListMethod<C, P, HalfResource<C, P>[] | Resource<C, P>[]>
} {
  /** A collection deste recurso */
  const resourceCollection = collection(client.db, resourcePath as string)

  return {
    /** Pega uma instancia do recurso */
    get: (id: string) =>
      getDoc(doc(resourceCollection, id)).then((doc) =>
        cleanupManager != undefined
          ? makeResource<C, P>(doc, resourcePath, cleanupManager, [])[0]
          : makeHalfResource<C, P>(doc, resourcePath)[0]
      ),

    /** Pega uma lista filtrada do recurso */
    getList: (filters: QueryFieldFilterConstraint[] = []) =>
      getDocs(query(resourceCollection, ...filters)).then((docs) =>
        cleanupManager != undefined
          ? (makeResource<C, P>(
              docs,
              resourcePath,
              cleanupManager,
              []
            ) as Resource<C, P>[])
          : (makeHalfResource<C, P>(docs, resourcePath) as HalfResource<C, P>[])
      ),
  }
}

// const getter = getResourceGetter(vase, 'players')

// getter.get('2').then((player) => player.)
