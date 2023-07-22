import { useArrayDifference, useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import {
  RouteLocationNormalizedLoaded,
  RouteRecordName,
  RouteRecordRaw,
} from 'vue-router'
import { localStorageKeys } from '../config/storageKeys'
import routes from '../router/routes'
import { computed } from 'vue'

// Gets name from route and throws if not present
const requireName = (route: RouteRecordRaw | RouteLocationNormalizedLoaded) => {
  if (route.name == undefined)
    throw new Error('Todas as rotas devem ter um nome')

  return route.name
}

/** Nomes de todos os prompts */
const allPrompts = routes
  .filter((route) => route.meta?.firstVisitPrompt)
  .map(requireName)

export const useNavigationData = defineStore('navigation-data', () => {
  /** Rotas de first visit prompt que ja foram visitadas */
  const visitedPrompts = useLocalStorage<Set<string>>(
    localStorageKeys.firstVisitPrompts,
    new Set()
  )

  /** Verifica se a rota atual corresponde a um prompt */
  const isVisitingPrompt = (route: { name?: RouteRecordName | null }) => {
    if (route.name && allPrompts.includes(route.name)) {
      visitedPrompts.value.add(route.name as string)

      return true
    }

    return false
  }

  /** Quais prompts ainda nao foram visitados */
  const unvisitedPrompts = computed(() =>
    allPrompts.filter(
      (prompt) => visitedPrompts.value.has(prompt as string) == false
    )
  )

  return { visitedPrompts, isVisitingPrompt, unvisitedPrompts }
})
