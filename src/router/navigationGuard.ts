import { auth } from '../api/firebase'
import type { NavigationGuardWithThis } from 'vue-router'
import { findMeta } from './utils/findMeta'

/** Dada uma rota, verifica se o usuario tem permissao para acessar ela e redireciona se necessario
 * @param route A rota a ser verificada
 * @param redirect Um metodo para realizar redirecionamento
 */
export const navigationGuard: NavigationGuardWithThis<undefined> = (to) => {
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
}

// export async function validateRoute(
//   route: RouteLocationNormalized,
//   redirect: (route: RouteLocationRaw | undefined) => void
// ) {
//   // Verifica se ha rotas na lista de first route prompt
//   if (store.state.univistedFirstVisitPrompts.length > 0) {
//     const { univistedFirstVisitPrompts } = store.state

//     // Pega o nome da rota alvo
//     const name = route.name?.toString()

//     // Verifica se a rota alvo eh uma dessas rotas
//     if (name != null && store.state.univistedFirstVisitPrompts.includes(name)) {
//       // Remove da lista
//       const index = univistedFirstVisitPrompts.indexOf(name)

//       univistedFirstVisitPrompts.splice(index, 1)

//       // Marca a rota como visitada
//       store.commit('assign', {
//         variable: 'univistedFirstVisitPrompts',
//         value: univistedFirstVisitPrompts,
//       })

//       localStorage.setItem(
//         `${localStorageKeys.firstVisitPromptPrefix}-${name}`,
//         'true'
//       )
//     }

//     // Caso nao seja
//     else {
//       // Vai para a ultima pagina da lista
//       redirect({ name: univistedFirstVisitPrompts[0] })

//       return
//     }
//   }

//   // Verifica se a rota necessita login
//   if (
//     route.matched.some(
//       (route) => route.meta.requiresLogin || route.meta.requireAuth
//     ) &&
//     store.getters.playerIsLoggedIn == false
//   ) {
//     // Redirect to login page
//     redirect({ name: 'login' })
//     return
//   }

//   // Sabemos que o usuario esta logado!

//   // Verifica se a rota necessita autenticacao (usuario com senha)
//   if (
//     route.matched.some((route) => route.meta.requireAuth) &&
//     store.state.playerJwt!.authenticated == false
//   ) {
//     // Redireciona para a pagina inicial
//     redirect({ name: 'home' })
//     return
//   }

//   // Verifica se a rota requer uma guilda selecionada
//   if (
//     route.matched.some((route) => route.meta.requiresSelectedGuild) &&
//     store.state.selectedGuild == null
//   ) {
//     // Tenta carregar uma
//     await store.dispatch('tryLoadLocalGuild', store)

//     // Se nao conseguir, vai para a home
//     if (store.state.selectedGuild == null) {
//       redirect({ name: 'home' })
//       return
//     }
//   }

//   redirect(undefined)
// }

// /** The guard will analyze each route the user navigates to and ensure the navigation is valid
//  *
//  * For example: when navigating to a route that requires authorization, it will ensure the user has the authorization. If not,
//  * it will redirect to the login page
//  */
// const navigationGuard: NavigationGuard = (to, from, next) =>
//   validateRoute(to, next)

// export default navigationGuard
