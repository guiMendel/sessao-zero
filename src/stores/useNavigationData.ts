import { localStorageKeys } from '@/utils/config/storageKeys'
import { firstVisitPrompts } from '@/router/firstVisitPrompts'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RouteRecordName } from 'vue-router'
import { defineStore } from './defineStore'

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

  /** Se deve ou nao ir automaticamente para a preferredGuildId do jogador em Home */
  const redirectToPreferredGuild = ref(true)

  return {
    visitedPrompts,
    isVisitingPrompt,
    unvisitedPrompts,
    redirectToPreferredGuild,
  }
})
