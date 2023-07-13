export interface Resource {
  createdAt: Date
  modifiedAt: Date
}

export type Uploadable<R extends Resource> = Omit<
  Omit<Partial<R>, 'createdAt'>,
  'modifiedAt'
> & {
  modifiedAt: string
}

export type UploadableComplete<R extends Resource> = Omit<
  Omit<R, 'createdAt'>,
  'modifiedAt'
> & {
  modifiedAt: string
  createdAt: string
}
