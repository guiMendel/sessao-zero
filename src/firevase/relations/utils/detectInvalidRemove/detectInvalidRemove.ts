import { FirevaseClient } from '@/firevase'
import { PathsFrom } from '@/firevase/types'
import { getDefinition } from '..'
import { RelationDefinitionFrom, Relations } from '../..'

/** Se a relacao for has-many, e a relacao respectiva do target path for required e has-one, rejeita */
export const detectInvalidRemove = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  path: P,
  relation: keyof Relations<C, P>
) => {
  const definition = getDefinition(client, path, relation, 'has-many')

  const targetRelations = client.relationSettings?.[
    definition.targetResourcePath
  ] as
    | undefined
    | Record<
        string,
        RelationDefinitionFrom<
          C,
          typeof definition.targetResourcePath,
          PathsFrom<C>
        >
      >

  if (targetRelations == undefined) return

  const oppositeRelation = Object.entries(targetRelations).filter(
    ([_, oppDefinition]) =>
      oppDefinition.type === 'has-one' &&
      oppDefinition.required &&
      (oppDefinition as any).relationKey === definition.relationKey
  )

  if (oppositeRelation.length > 0) {
    const [oppRelation] = oppositeRelation[0]

    throw new Error(
      `Proibido dar remove na relacao ${relation as string} de path ${
        path as string
      }, pois isso poderia violar a relacao required ${oppRelation} de ${
        definition.targetResourcePath as string
      }`
    )
  }
}
