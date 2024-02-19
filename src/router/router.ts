import 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { navigationGuard } from './guard'
import routes from './routes'
import { setTitleFromRoute } from './utils/setTitleFromRoute'

// === TIPAGEM DO META

export interface RouteMetas {
  /** Que tipo de autenticacao o jogador deve ter */
  requireAuth?: 'authenticated' | 'unauthenticated'

  /** Atualiza o titulo da pagina (aparece na aba do chrome) */
  title?: string

  /** Se esta pagina deve ser apresentada ao usuario caso essa seja sua primeira visita. So eh valido em rotas raizes */
  firstVisitPrompt?: boolean

  /** Se esta pagina nao deve mostrar o botao de voltar de pagina */
  noGoBackButton?: boolean

  /** Se o jogador deve ser dono da guilda atualmente selecionada */
  mustOwnGuild?: boolean

  /** Se o player profile icon deve ter position absolute */
  playerPanelPositionAbsolute?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMetas {}
}

// === VERIFICACOES EXTRAS DE NAVEGACAO

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Apply the navigation guard
router.beforeEach(navigationGuard)

router.afterEach(setTitleFromRoute)
