export type ResourceType = 'players' | 'guilds'

export type Resource<P> = P & {
  createdAt: Date
  modifiedAt: Date
  id: string
}

export type Uploadable<P> = P & {
  modifiedAt: string
  createdAt: string
}
