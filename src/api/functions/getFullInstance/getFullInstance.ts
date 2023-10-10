import {
  CleanupManager,
  FullInstance,
  ResourcePath,
  buildRelations,
  getResource,
} from '@/api'
import { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'

/** Gera um (ou varios) FullInstance dos dados recebidos como documento ou query
 * @param resourcePath O path que define o tipo de objeto a ser gerado
 * @param snapshot Possui dados para popular as propriedades da nova instancia
 * @param cleanupManager O manager para associar a novos recursos alocados
 * @param previousValues Uma piscina de valores da qual podemos reutilizar recursos para nao ter de recriar eles
 */
export const getFullInstance = <P extends ResourcePath>(
  snapshot: DocumentSnapshot | QuerySnapshot,
  resourcePath: P,
  cleanupManager: CleanupManager,
  previousValues: FullInstance<P>[]
): Array<FullInstance<P> | undefined> => {
  /** Organiza os valores anteriores para aumentar eficiencia */
  const previousValuesMap = previousValues.reduce(
    (map, properties) => ({ ...map, [properties.id]: properties }),
    {} as Record<string, FullInstance<P>>
  )

  /** Gera os resources a partir dos snapshots */
  const extractedResources = getResource(snapshot, resourcePath)

  /** Injeta relacoes para tornar os recursos em instancias */
  return extractedResources.map(
    (extractedResource) =>
      extractedResource && {
        ...extractedResource,
        ...buildRelations({
          previousValues: previousValuesMap,
          cleanupManager,
          source: extractedResource,
          sourcePath: resourcePath,
        }),
      }
  )
}
