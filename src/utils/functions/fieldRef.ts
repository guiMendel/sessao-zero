import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { Ref, ref } from 'vue'

/** Tipos aceitos pelo field */
export type AllowedFieldTypes = string | boolean | number | File | undefined

/** Uma funcao que valida um input fornecido por um usuario.
 * @param value o valor fornecido.
 * @returns true se for um valor valido, uma mensagem de error se nao for.
 */
export type FieldValidator<T extends AllowedFieldTypes> = (
  value: T
) => true | string

/** Propriedades basicas de um campo */
type FieldType<T extends AllowedFieldTypes> = {
  /** O nome deste campo */
  name: string
} & ( // Tipos de texto
  | (T extends string
      ?
          | { type: 'single-line' | 'multi-line' }
          | {
              type: 'select'
              options: T[]
            }
      : never)

  // Tipos de booleano
  | (T extends boolean ? { type: 'toggle' } : never)

  // Tipos de arquivo
  | (T extends File ? { type: 'file' } : never)

  // Tipos de numero
  | (T extends number
      ? {
          type: 'number'

          min?: number
          max?: number
        }
      : never)
)

type GeneralOptions<T extends AllowedFieldTypes> = {
  /** Permite validar o input */
  validator?: FieldValidator<T>

  /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
  persist?: (value: T) => Promise<void>

  /** Permite obter uma mensagem de descrição do campo, dado o seu valor atual */
  describe?: (value: T) => string
}

type FieldOptions<T extends AllowedFieldTypes> = GeneralOptions<T> & {
  /** O valor inicial */
  initialValue: T

  /** Se fornecido, utiliza LS para persistir esse campo */
  localStoragePrefix?: string

  /** Se fornecido, utiliza SS para persistir esse campo */
  sessionStoragePrefix?: string
}

type FileFieldOptions = GeneralOptions<File | undefined> & {
  /** A promessa que fornece o valor inicial */
  initializer: Promise<File | undefined> | undefined
}

/** Um ref que tambem armazena estado imutavel sobre um campo e metodos que permitem
 * validar, persistir e obter uma descrição do campo.
 */
export type FieldRef<T extends AllowedFieldTypes> = Ref<T> &
  FieldType<T> & {
    /** Se o valor deste campo ainda nao foi carregado completamente */
    loaded: boolean

    /** Define como validar o campo */
    validate: FieldValidator<T>

    /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
    persist?: () => Promise<void>

    /** Permite obter uma mensagem de descrição do campo */
    describe: () => string
  }

/** Gera um FieldRef */
export function fieldRef<T extends Exclude<AllowedFieldTypes, File>>(
  field: FieldType<T> | string,
  options: FieldOptions<T>
): FieldRef<T> {
  const {
    initialValue,
    localStoragePrefix,
    sessionStoragePrefix,
    validator,
    persist,
    describe,
  } = {
    validator: () => true as const,
    describe: () => '',
    ...options,
  }

  const fieldType: FieldType<T> =
    typeof field === 'string' ? { name: field, type: 'single-line' } : field

  let valueRef: Ref<T>

  if (localStoragePrefix != undefined)
    valueRef = useLocalStorage<T>(
      `${localStoragePrefix}_${fieldType.name}`,
      initialValue
    )
  else if (sessionStoragePrefix != undefined)
    valueRef = useSessionStorage<T>(
      `${sessionStoragePrefix}_${fieldType.name}`,
      initialValue
    )
  else valueRef = ref<T>(initialValue) as Ref<T>

  const fieldRef: FieldRef<T> = Object.assign(valueRef, {
    ...fieldType,
    loaded: true,
    validate: validator,
    persist: persist ? () => persist(valueRef.value) : undefined,
    describe: () => describe(valueRef.value),
  })

  return fieldRef
}

export const isFieldValid = (...fields: FieldRef<any>[]) =>
  fields.every((field) => field.validate(field.value) === true)

export function fileFieldRef(
  field: string,
  options: FileFieldOptions
): FieldRef<File | undefined> {
  const { initializer, validator, persist, describe } = {
    validator: () => true as const,
    describe: () => '',
    ...options,
  }

  const fieldType: FieldType<File> = { name: field, type: 'file' }

  const valueRef = ref<File | undefined>(undefined)

  const fieldRef: FieldRef<File | undefined> = Object.assign(valueRef, {
    ...fieldType,
    loaded: false,
    validate: validator,
    persist: persist ? () => persist(valueRef.value) : undefined,
    describe: () => describe(valueRef.value),
  })

  if (initializer) {
    initializer.then((file) => {
      valueRef.value = file

      setTimeout(() => (fieldRef.loaded = true), 50)
    })
  } else fieldRef.loaded = true

  return fieldRef
}
