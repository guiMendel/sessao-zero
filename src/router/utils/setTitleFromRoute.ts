import { setTitle } from '@/utils/functions'
import { nextTick } from 'vue'
import { RouteLocationNormalized } from 'vue-router'

/** Permite alterar o titulo da pagina */
// Usa-se o next stick de acordo com https://stackoverflow.com/a/51640162/14342654
export const setTitleFromRoute = (route: RouteLocationNormalized) =>
  nextTick(() => setTitle(route.meta.title))
