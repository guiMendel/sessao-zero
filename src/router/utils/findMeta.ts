import { RouteLocationNormalized } from 'vue-router'
import { RouteMetas } from '..'

/** Procura nesta rota e nas rotas pais pelo meta fornecido
 * @param route rota na qual procurar
 * @param targetMeta o meta a procurar
 * @returns o valor do encontrado. Se nao encontrar, undefined
 */
export function findMeta(
  { matched }: RouteLocationNormalized,
  targetMeta: keyof RouteMetas
) {
  return matched.find(({ meta }) => meta[targetMeta] != undefined)?.meta[
    targetMeta
  ]
}
