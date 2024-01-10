import { Store, StoreGeneric, _UnwrapAll, storeToRefs } from 'pinia'

/** Como storeToRefs to Pinia, mas preserva syncableRefs e tambem fornece os metodos */
export const unwrapStore = <S extends StoreGeneric>(store: S) =>
  ({
    ...store,
    ...storeToRefs(store),
  } as S extends Store<string, _UnwrapAll<Pick<infer T, any>>, any, any>
    ? T
    : never)
