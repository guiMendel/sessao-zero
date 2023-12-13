import { ResourceProperties } from '@/api'

export type Resource<P extends ResourceProperties> = P & {
  createdAt: Date
  modifiedAt: Date
  id: string
}

export type Uploadable<P extends ResourceProperties> = P & {
  modifiedAt: string
  createdAt: string
}
