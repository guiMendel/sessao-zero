import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { localStorageKeys } from '../config/storageKeys'

export const useAccessibility = defineStore('accessibility', () => {
  /** Caso deve ativar o modo alto contraste, com cores fortes para auxiliar a dificuldade de visao */
  const highContrast = useLocalStorage(localStorageKeys.highContrast, false)

  return { highContrast }
})
