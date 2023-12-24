import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { CleanupManager } from '@/utils/classes'
import { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'
import { buildRelations } from '../../../relations/buildRelations'
import { makeHalfResource } from '../../functions/makeHalfResource'
import { Resource } from '../../types'

/** Gera um (ou varios) Resource C, dos dados recebidos como documento ou query
 * @param resourcePath O path que define o tipo de objeto a ser gerado
 * @param snapshot Possui dados para popular as propriedades da nova instancia
 * @param cleanupManager O manager para associar a novos recursos alocados
 * @param previousValues Uma piscina de valores da qual podemos reutilizar recursos para nao ter de recriar eles
 */
export const makeResource = <C extends FirevaseClient, P extends PathsFrom<C>>(
  client: C,
  snapshot: DocumentSnapshot | QuerySnapshot,
  resourcePath: P,
  cleanupManager: CleanupManager,
  previousValues: Resource<C, P>[]
): Array<Resource<C, P> | undefined> => {
  /** Organiza os valores anteriores para aumentar eficiencia */
  const previousValuesMap = previousValues.reduce(
    (map, properties) => ({ ...map, [properties.id]: properties }),
    {} as Record<string, Resource<C, P>>
  )

  /** Gera os resources a partir dos snapshots */
  const extractedResources = makeHalfResource<C, P>(snapshot, resourcePath)

  /** Injeta relacoes para tornar os recursos em instancias */
  return extractedResources.map(
    (extractedResource) =>
      extractedResource && {
        ...extractedResource,
        ...buildRelations({
          previousValues: previousValuesMap,
          cleanupManager,
          source: extractedResource,
          client,
        }),
      }
  )
}
