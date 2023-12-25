import { Mock } from 'vitest'
import { makeHalfResource } from '../makeHalfResource'
import { makeResource } from '.'
import { FirevaseClient } from '@/firevase'
import { CleanupManager } from '@/utils/classes'
import { DocumentSnapshot } from 'firebase/firestore'
import { buildRelations } from '@/firevase/relations/buildRelations'

vi.mock('../makeHalfResource')
vi.mock('@/firevase/relations/buildRelations')

const mockBuildRelations = buildRelations as Mock
const mockMakeHalfResource = makeHalfResource as Mock

const mockClient = {} as FirevaseClient

describe('makeResource', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockMakeHalfResource.mockImplementation((data) =>
      Array.isArray(data) ? data : [data]
    )

    mockBuildRelations.mockImplementation((args) => ({ buildRelations: args }))
  })

  it.todo('should not call buildRelations when resourceLayersLimit is 0')

  describe('query snapshot', () => {
    it('should provide the values returned by makeHalfResource', () => {
      const data = [
        { name: 'Aluvius', count: 10 },
        { name: 'Chakron', count: 2 },
      ]

      mockBuildRelations.mockReturnValue({})

      const resource = makeResource(
        mockClient,
        data as unknown as DocumentSnapshot,
        'test',
        new CleanupManager(),
        []
      )

      expect(resource).toStrictEqual(data)
    })

    it('should call buildRelations with the correct params and inject the result', () => {
      const previousValues = [
        { id: '0', name: 'baba' },
        { id: '1', name: 'yaga' },
      ]

      const cleanupManager = new CleanupManager()

      const data = [
        { name: 'Aluvius', count: 10 },
        { name: 'Chakron', count: 2 },
      ]

      const resource = makeResource(
        mockClient,
        data as unknown as DocumentSnapshot,
        'test',
        cleanupManager,
        previousValues
      )

      expect(resource).toStrictEqual(
        data.map((data) => ({
          ...data,
          buildRelations: {
            cleanupManager,
            previousValues: {
              0: previousValues[0],
              1: previousValues[1],
            },
            source: data,
            client: mockClient,
          },
        }))
      )
    })
  })

  describe('document snapshot', () => {
    it('handles undefined', () => {
      const resource = makeResource(
        mockClient,
        undefined as unknown as DocumentSnapshot,
        'test',
        new CleanupManager(),
        []
      )

      expect(resource).toStrictEqual([undefined])
    })

    it('should provide the values returned by makeHalfResource', () => {
      const data = { name: 'Aluvius', count: 10 }

      mockBuildRelations.mockReturnValue({})

      const resource = makeResource(
        mockClient,
        data as unknown as DocumentSnapshot,
        'test',
        new CleanupManager(),
        []
      )

      expect(resource).toStrictEqual([data])
    })

    it('should call buildRelations with the correct params and inject the result', () => {
      const previousValues = [
        { id: '0', name: 'baba' },
        { id: '1', name: 'yaga' },
      ]

      const cleanupManager = new CleanupManager()

      const data = { name: 'Aluvius', count: 10 }

      const resource = makeResource(
        mockClient,
        data as unknown as DocumentSnapshot,
        'test',
        cleanupManager,
        previousValues
      )

      expect(resource).toStrictEqual([
        {
          ...data,
          buildRelations: {
            cleanupManager,
            previousValues: {
              0: previousValues[0],
              1: previousValues[1],
            },
            source: data,
            client: mockClient,
          },
        },
      ])
    })
  })
})
