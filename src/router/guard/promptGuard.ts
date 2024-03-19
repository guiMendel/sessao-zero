import type { RouteLocationNormalized } from 'vue-router'
import { useNavigationData } from '@/stores/useNavigationData'
import { toValue } from 'vue'

export const promptGuard = (to: RouteLocationNormalized) => {
  // Verifica se ha prompts ainda nao visitados
  const navigationData = useNavigationData()

  // So age se ainda nao estiver em um prompt e houver outros prompts
  if (
    navigationData.isVisitingPrompt(to) == false &&
    toValue(navigationData.unvisitedPrompts).length > 0
  )
    // Vai para o proximo prompt
    return { name: toValue(navigationData.unvisitedPrompts)[0] }
}
