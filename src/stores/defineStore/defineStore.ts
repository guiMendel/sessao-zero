import { unwrapStore } from '@/utils/functions'
import { defineStore as originalDefineStore } from 'pinia'

export const defineStore = <T>(name: string, storeDefiner: () => T) => {
  const store = originalDefineStore(name, storeDefiner)

  return () => unwrapStore(store() as any) as T
}
