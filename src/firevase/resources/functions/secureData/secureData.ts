type FunctionPropertyNames<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

export const fieldsNotToUpload = [
  'createdAt',
  'modifiedAt',
  'password',
  'senha',
  'id',
] as const

export type FieldsNotToUpload = (typeof fieldsNotToUpload)[number]

/** Remove metodos, dados que nao queremos fazer upload, e campos adicionais solicitados */
export const secureData = <D extends Record<string, any>, F extends string>(
  data: D,
  ...removeFields: F[]
): Omit<D, F | FunctionPropertyNames<D> | FieldsNotToUpload> => {
  // Remove metodos
  const secureData = JSON.parse(JSON.stringify(data)) as D

  for (const field of [...removeFields, ...fieldsNotToUpload])
    delete secureData[field]

  return secureData
}
