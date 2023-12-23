import { FirevaseClient } from '@/firevase'
import { syncableRef } from '@/firevase/Syncable'
import { RelationsRefs } from '@/firevase/relations'
import { HalfResource, Resource, Uploadable } from '@/firevase/resources'
import {
  ConstrainRelationSettings,
  ManyToManyFrom,
  PathsFrom,
  PropertiesFrom,
} from '@/firevase/types'
import { CleanupManager } from '@/utils/classes'
import { setUpFirebaseMocks } from './firebase'
import { sample } from '@/utils/functions'

setUpFirebaseMocks()

/** Allows passing an array of proeprties instead of a single one, for random sampling */
type DefaultProperties<C extends FirevaseClient, P extends PathsFrom<C>> = {
  [property in keyof PropertiesFrom<C>[P]]:
    | PropertiesFrom<C>[P][property]
    | Array<PropertiesFrom<C>[P][property]>
    | (() => PropertiesFrom<C>[P][property])
}

export const makeResourceMocker = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>(
  client: C,
  path: P,
  defaultsProperties: DefaultProperties<C, P>
) => {
  /** Mocks in a resource level */
  function mockResource(
    level?: 'resource',
    overrides?: Partial<Resource<C, P>>
  ): Resource<C, P>

  /** Mocks in a half resource level */
  function mockResource(
    level: 'half-resource',
    overrides?: Partial<HalfResource<C, P>>
  ): HalfResource<C, P>

  /** Mocks in an uploadable level */
  function mockResource(
    level: 'uploadable',
    overrides?: Partial<Uploadable<C, P>>
  ): Uploadable<C, P>

  /** Mocks in a properties level */
  function mockResource(
    level: 'properties',
    overrides?: Partial<PropertiesFrom<C>[P]>
  ): PropertiesFrom<C>[P]

  // Implementation
  function mockResource(
    level?: 'properties' | 'half-resource' | 'resource' | 'uploadable',
    overrides?: Partial<Resource<C, P> | Uploadable<C, P>>
  ):
    | Resource<C, P>
    | HalfResource<C, P>
    | PropertiesFrom<C>[P]
    | Uploadable<C, P> {
    const parseProperty = (
      property: DefaultProperties<C, P>[keyof DefaultProperties<C, P>]
    ) => {
      if (typeof property === 'function') return property()

      return Array.isArray(property) ? sample(property) : property
    }

    const properties = Object.entries(defaultsProperties).reduce(
      (properties, [property, definition]) => ({
        ...properties,
        [property]: parseProperty(definition),
      }),
      {} as PropertiesFrom<C>[P]
    )

    if (level === 'properties') return { ...properties, ...overrides }

    if (level === 'uploadable')
      return {
        ...properties,
        createdAt: new Date().toString(),
        modifiedAt: new Date().toString(),
        ...overrides,
      }

    const halfResource: HalfResource<C, P> = {
      ...properties,
      createdAt: new Date(),
      id: '1',
      modifiedAt: new Date(),
      resourcePath: path,
    }

    if (level === 'half-resource') return { ...halfResource, ...overrides }

    const relations =
      client.relationSettings?.[path] == undefined
        ? ({} as RelationsRefs<C, P>)
        : Object.entries(
            client.relationSettings[path] as ConstrainRelationSettings<
              PropertiesFrom<C>,
              ManyToManyFrom<C>
            >
          ).reduce(
            (relations, [relation, definition]) =>
              ({
                ...relations,
                [relation]: syncableRef<C, P, any>(
                  client,
                  path,
                  // @ts-ignore
                  definition.type === 'has-one'
                    ? 'empty-document'
                    : 'empty-query',
                  new CleanupManager()
                ),
              } as RelationsRefs<C, P>),
            {} as RelationsRefs<C, P>
          )

    return {
      ...halfResource,
      ...relations,
      ...overrides,
    }
  }

  return mockResource
}
