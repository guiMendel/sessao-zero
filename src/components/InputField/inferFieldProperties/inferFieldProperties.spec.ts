import {
  PropertyNameRelation,
  fieldPropertyNameRelations,
  inferFieldProperties,
} from '.'

describe('inferFieldProperties', () => {
  const cachedProperties: Record<string, PropertyNameRelation> = {}

  const fieldNames = fieldPropertyNameRelations.reduce(
    (fieldNames, properties) => {
      for (const name of properties.matchNames)
        cachedProperties[name] = {
          type: 'text',
          autocomplete: 'on',
          display: name,
          ...properties,
        }

      return [...fieldNames, ...properties.matchNames]
    },
    [] as string[]
  )

  it.each(fieldNames)(
    'should return the correct properties for field %s',
    (fieldName) => {
      expect(inferFieldProperties(fieldName, '')).toStrictEqual(
        cachedProperties[fieldName]
      )
    }
  )
})
