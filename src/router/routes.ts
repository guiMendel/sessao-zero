import { generateLink } from '@/api/guilds'
import { Adventure, AdventuresIndex, CreateAdventure } from '@/views/Adventures'
import { Configurations } from '@/views/Configurations'
import {
  AvailableGuilds,
  CurrentGuilds,
  Guild,
  GuildConfigurations,
  GuildInvitation,
  GuildMembers,
} from '@/views/Guilds'
import { Home } from '@/views/Home'
import { Login } from '@/views/Login'
import { CreatePlayer, Player } from '@/views/Players'
import { AccessibilityPrompt } from '@/views/Prompts'
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
    // Nessa rota, adiciona as informacoes de convite na session storage e redireciona para home
    path: generateLink(':guildId', {
      fullPath: false,
      overrideToken: ':token',
    }),
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
        component: CurrentGuilds,
        name: 'home',
        meta: { noGoBackButton: true, title: 'Guildas' },
      },
      {
        path: 'add-guild',
        component: AvailableGuilds,
        name: 'add-guild',
        meta: { noGoBackButton: true, title: 'Encontrar guildas' },
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
            meta: { title: 'Guilda' },
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
            meta: { mustOwnGuild: true, title: 'Configurações de guilda' },
          },
          {
            path: 'members',
            name: 'guild-members',
            component: GuildMembers,
            meta: { title: 'Membros da guilda' },
          },
          {
            path: 'adventure/:adventureId',
            name: 'adventure',
            component: Adventure,
            meta: { title: 'Aventura' },
          },
        ],
      },
      {
        path: 'player/:playerId',
        meta: { title: 'Jogador' },
        children: [
          {
            path: '',
            component: Player,
            name: 'player',
            meta: { playerPanelPositionAbsolute: true },
          },
        ],
      },
      {
        path: 'configurations',
        name: 'configurations',
        component: Configurations,
        meta: { title: 'Configurações' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: () => ({ path: '/' }) },
])

export default routes
