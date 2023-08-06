import { localStorageKeys } from '@/config/storageKeys'
import { firstVisitPrompts } from '@/router/firstVisitPrompts'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { RouteRecordName } from 'vue-router'

export const useNavigationData = defineStore('navigation-data', () => {
  /** Rotas de first visit prompt que ja foram visitadas */
  const visitedPrompts = useLocalStorage<Set<string>>(
    localStorageKeys.firstVisitPrompts,
    new Set()
  )

  /** Verifica se a rota atual corresponde a um prompt */
  const isVisitingPrompt = (route: { name?: RouteRecordName | null }) => {
    if (route.name && firstVisitPrompts.includes(route.name as string)) {
      visitedPrompts.value.add(route.name as string)

      return true
    }

    return false
  }

  /** Quais prompts ainda nao foram visitados */
  const unvisitedPrompts = computed(() =>
    firstVisitPrompts.filter(
      (prompt) => visitedPrompts.value.has(prompt as string) == false
    )
  )

  return { visitedPrompts, isVisitingPrompt, unvisitedPrompts }
})
