import type { NavigationGuardWithThis } from 'vue-router'
import { auth } from '../api/firebase'
import { useNavigationData } from '../stores/useNavigationData'
import { findMeta } from './utils/findMeta'

/** Dada uma rota, verifica se o usuario tem permissao para acessar ela e redireciona se necessario
 * @param route A rota a ser verificada
 * @param redirect Um metodo para realizar redirecionamento
 */
export const navigationGuard: NavigationGuardWithThis<undefined> = (to) => {
  // Verifica autenticacao
  if (
    findMeta(to, 'requireAuth') == 'authenticated' &&
    auth.currentUser == null
  ) {
    return { name: 'login' }
  }

  if (
    findMeta(to, 'requireAuth') == 'unauthenticated' &&
    auth.currentUser != null
  ) {
    return { name: 'home' }
  }

  // Verifica se ha prompts ainda nao visitados
  const navigationData = useNavigationData()

  // So age se ainda nao estiver em um prompt e houver outros prompts
  if (
    navigationData.isVisitingPrompt(to) == false &&
    navigationData.unvisitedPrompts.length > 0
  )
    // Vai para o proximo prompt
    return { name: navigationData.unvisitedPrompts[0] }
}
