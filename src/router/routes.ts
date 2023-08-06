import { makeGuildInvitation } from '@/utils'
import { CreatePlayer, Login } from '@/views'
import Adventure from '@/views/Adventures/Adventure.vue'
import AdventuresIndex from '@/views/Adventures/AdventuresIndex.vue'
import CreateAdventure from '@/views/Adventures/CreateAdventure.vue'
import Guild from '@/views/Guilds/Guild.vue'
import GuildInvitation from '@/views/Guilds/GuildInvitation.vue'
import GuildsIndex from '@/views/Guilds/GuildsIndex.vue'
import Home from '@/views/Home.vue'
import Player from '@/views/Players/Player.vue'
import AccessibilityPrompt from '@/views/Prompts/AccessibilityPrompt.vue'
import BetaWelcome from '@/views/Prompts/BetaWelcome.vue'
import { RouteRecordRaw } from 'vue-router'
import { addFirstVisitPrompts } from './firstVisitPrompts'

/** As rotas da aplicacao */
const routes: Array<RouteRecordRaw> = addFirstVisitPrompts([
  {
    path: '/accessibility-prompt',
    component: AccessibilityPrompt,
    name: 'accessibility-prompt',
    meta: { noGoBackButton: true },
  },
  {
    path: '/beta-welcome',
    component: BetaWelcome,
    name: 'beta-welcome',
    meta: { noGoBackButton: true },
  },
  {
    // Nessa rota, adiciona as informacoes de convite na session storage e redireciona para home
    path: makeGuildInvitation(false),
    props: true,
    component: GuildInvitation,
    name: 'guild-invitation',
  },
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      title: 'Login',
      requireAuth: 'unauthenticated',
      noGoBackButton: true,
    },
  },
  {
    path: '/create-player',
    component: CreatePlayer,
    name: 'create-player',
    props: true,
    meta: { title: 'Criar Jogador', requireAuth: 'unauthenticated' },
  },
  {
    path: '/',
    component: Home,
    name: 'home',
    meta: { requireAuth: 'authenticated' },
    children: [
      {
        path: '',
        component: GuildsIndex,
        name: 'guilds',
        meta: { noGoBackButton: true },
      },
      {
        path: 'guild/:guildId',
        component: Guild,
        name: 'guild',
        children: [
          {
            path: '',
            component: AdventuresIndex,
            name: 'adventures',
          },
          {
            path: 'adventure/:adventureId',
            component: Adventure,
            name: 'adventure',
            meta: { title: 'Aventura' },
            props: (route) => {
              const adventureId = Number.parseInt(
                route.params.adventureId as string,
                10
              )

              if (Number.isNaN(adventureId)) {
                return 0
              }

              return { adventureId }
            },
          },
          {
            path: 'create-adventure',
            component: CreateAdventure,
            name: 'create-adventure',
            meta: { title: 'Criar Aventura' },
          },
        ],
      },
      {
        path: 'player/:playerId',
        component: Player,
        name: 'player',
        meta: { title: 'Jogador' },
      },
    ],
  },
])

export default routes
