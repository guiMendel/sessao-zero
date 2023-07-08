import { RouteLocationNormalized, RouteMeta } from 'vue-router'

/** Procura nesta rota e nas rotas pais pelo meta fornecido
 * @param route rota na qual procurar
 * @param targetMeta o meta a procurar
 * @returns o valor do encontrado. Se nao encontrar, undefined
 */
export function findMeta(
  { matched }: RouteLocationNormalized,
  targetMeta: keyof RouteMeta
): RouteMeta[string] {
  return matched.find(({ meta }) => meta[targetMeta] != undefined)?.meta[targetMeta]
}
