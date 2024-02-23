import { onBeforeUnmount, ref } from 'vue'
import { defineStore } from '../defineStore'

const cacheSize = 4

export const useTrackErrors = defineStore('track-errors', () => {
  const lastErrors = ref<string[]>([])

  const trackError = ({ error }: ErrorEvent) => {
    lastErrors.value = [
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
      ...lastErrors.value,
    ].slice(0, cacheSize)
  }

  window.addEventListener('error', trackError)

  onBeforeUnmount(() => window.removeEventListener('error', trackError))

  return { lastErrors }
})
