import 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { navigationGuard } from './guard'
import routes from './routes'
import { setTitle } from './utils/setTitle'

// === TIPAGEM DO META

export interface RouteMetas {
  /** Que tipo de autenticacao o jogador deve ter */
  requireAuth?: 'authenticated' | 'unauthenticated'

  /** Atualiza o titulo da pagina (aparece na aba do chrome) */
  title?: string

  /** Nao mostra o menu principal (info sobre usuario & logout) */
  noMainMenu?: boolean

  /** Se esta pagina deve ser apresentada ao usuario caso essa seja sua primeira visita. So eh valido em rotas raizes */
  firstVisitPrompt?: boolean

  /** Se esta pagina nao deve mostrar o botao de voltar de pagina */
  noGoBackButton?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMetas {}
}

// === VERIFICACOES EXTRAS DE NAVEGACAO

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Apply the navigation guard
router.beforeEach(navigationGuard)

router.afterEach((to) => setTitle(to.meta.title as string | undefined))

export default router
