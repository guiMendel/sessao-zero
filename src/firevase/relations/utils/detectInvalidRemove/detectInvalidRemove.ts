import {
  ResourcePath,
  UnrefedResourceRelations,
  relationSettings,
} from '@/firevase/resources'
import { getDefinition } from '..'

/** Se a relacao for has-many, e a relacao respectiva do target path for required e has-one, rejeita */
export const detectInvalidRemove = <P extends ResourcePath>(
  path: P,
  relation: keyof UnrefedResourceRelations<P>
) => {
  const definition = getDefinition(path, relation, 'has-many')

  const oppositeRelation = Object.entries(
    relationSettings[definition.targetResourcePath]
  ).filter(
    ([_, oppDefinition]) =>
      oppDefinition.type === 'has-one' &&
      oppDefinition.required &&
      oppDefinition.relationKey === definition.relationKey
  )

  if (oppositeRelation.length > 0) {
    const [oppRelation] = oppositeRelation[0]

    throw new Error(
      `Proibido dar remove na relacao ${
        relation as string
      } de path ${path}, pois isso poderia violar a relacao required ${oppRelation} de ${
        definition.targetResourcePath
      }`
    )
  }
}
