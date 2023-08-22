export interface Resource {
  createdAt: Date
  modifiedAt: Date
  uid: string
}

export type Uploadable<R extends Resource> = Omit<
  R,
  'modifiedAt' | 'createdAt' | 'uid' | 'password'
> & {
  modifiedAt: string
  createdAt: string
}

export type PartialUploadable<R extends Resource> = Omit<
  Partial<R>,
  'modifiedAt' | 'createdAt' | 'uid' | 'password'
> & {
  modifiedAt: string
  createdAt: string
}
