import { RouteRecordRaw } from 'vue-router'

/** Quais rotas voa ter fistVistPrompt
 * Precisa ser feito assim, se nao o storybook quebra. Ele eh lixoso assim mesmo
 */
export const firstVisitPrompts = ['accessibility-prompt', 'beta-welcome']

/** Adiciona as metas de firstVisitPrompts as rotas */
export const addFirstVisitPrompts = (routes: Array<RouteRecordRaw>) =>
  routes.map((route) => {
    if (firstVisitPrompts.includes(route.name as string))
      route.meta
        ? (route.meta.firstVisitPrompt = true)
        : (route.meta = { firstVisitPrompt: true })

    return route
  })
