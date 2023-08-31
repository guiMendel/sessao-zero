import { DocumentData } from 'firebase/firestore'

export type ResourceType = 'players' | 'guilds'

export interface Resource extends DocumentData {
  createdAt: Date
  modifiedAt: Date
  id: string
}

export type Uploadable<R extends Resource> = Omit<
  R,
  'modifiedAt' | 'createdAt' | 'id' | 'password'
> & {
  modifiedAt: string
  createdAt: string
}

export type PartialUploadable<R extends Resource> = Omit<
  Partial<R>,
  'modifiedAt' | 'createdAt' | 'id' | 'password'
> & {
  modifiedAt: string
  createdAt: string
}
