import { Guild, Player, ResourcePaths, ResourceTypeToProperties } from '@/types'
import { DocumentData } from 'firebase/firestore'

export type PropertyExtractor<P> = (id: string, documentData: DocumentData) => P

const defaultExtractor = <T>(_: string, documentData: DocumentData): T =>
  ({
    ...documentData,
  } as T)

export const propertyExtractors: {
  [resourceType in ResourcePaths]: PropertyExtractor<
    ResourceTypeToProperties[resourceType]
  >
} = { guilds: defaultExtractor<Guild>, players: defaultExtractor<Player> }
