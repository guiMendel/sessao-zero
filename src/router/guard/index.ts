import type { NavigationGuard } from 'vue-router'
import { authenticationGuard } from './authenticationGuard'
import { promptGuard } from './promptGuard'
import { ownerGuard } from './ownerGuard'

/** Dada uma rota, verifica se o usuario tem permissao para acessar ela e redireciona se necessario
 * @param route A rota a ser verificada
 * @param redirect Um metodo para realizar redirecionamento
 */
export const navigationGuard: NavigationGuard = (to) => {
  // Aplica todos os guardas
  return authenticationGuard(to) ?? promptGuard(to) ?? ownerGuard(to)
}
