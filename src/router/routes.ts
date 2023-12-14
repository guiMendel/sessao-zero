import { makeGuildInvitation } from '@/api/resourcePaths/guilds'
import Adventure from '@/views/Adventures/Adventure.vue'
import AdventuresIndex from '@/views/Adventures/AdventuresIndex.vue'
import CreateAdventure from '@/views/Adventures/CreateAdventure.vue'
import { Configurations } from '@/views/Configurations'
import { Guild, GuildConfigurations, GuildsIndex } from '@/views/Guilds'
import GuildInvitation from '@/views/Guilds/GuildInvitation.vue'
import { Home } from '@/views/Home'
import { Login } from '@/views/Login'
import { CreatePlayer } from '@/views/Players'
import Player from '@/views/Players/Player.vue'
import { AccessibilityPrompt, BetaWelcome } from '@/views/Prompts'
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
    meta: { requireAuth: 'authenticated' },
    children: [
      {
        path: '',
        component: GuildsIndex,
        name: 'home',
        meta: { noGoBackButton: true },
      },
      {
        path: 'guild/:guildId',
        component: Guild,
        meta: { noGoBackButton: true },
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
          {
            path: 'configurations',
            name: 'guild-configurations',
            component: GuildConfigurations,
            meta: { mustOwnGuild: true },
          },
        ],
      },
      {
        path: 'player/:playerId',
        component: Player,
        name: 'player',
        meta: { title: 'Jogador' },
      },
      {
        path: 'configurations',
        name: 'configurations',
        component: Configurations,
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: () => ({ path: '/' }) },
])

export default routes
