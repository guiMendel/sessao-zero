import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { Ref, ref } from 'vue'

/** Tipos aceitos pelo field */
export type AllowedFieldTypes = string | boolean | number

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

  // Tipos de numero
  | (T extends number
      ? {
          type: 'number'

          min?: number
          max?: number
        }
      : never)
)

type FieldOptions<T extends AllowedFieldTypes> = {
  /** O valor inicial */
  initialValue: T

  /** Se fornecido, utiliza LS para persistir esse campo */
  localStoragePrefix?: string

  /** Se fornecido, utiliza SS para persistir esse campo */
  sessionStoragePrefix?: string

  /** Permite validar o input */
  validator?: FieldValidator<T>

  /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
  persist?: (value: T) => Promise<void>

  /** Permite obter uma mensagem de descrição do campo, dado o seu valor atual */
  describe?: (value: T) => string
}

/** Um ref que tambem armazena estado imutavel sobre um campo e metodos que permitem
 * validar, persistir e obter uma descrição do campo.
 */
export type FieldRef<T extends AllowedFieldTypes> = Ref<T> &
  FieldType<T> & {
    /** Define como validar o campo */
    validate: FieldValidator<T>

    /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
    persist?: () => Promise<void>

    /** Permite obter uma mensagem de descrição do campo */
    describe: () => string
  }

/** Gera um FieldRef */
export function fieldRef<T extends AllowedFieldTypes>(
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
    validate: validator,
    persist: persist ? () => persist(valueRef.value) : undefined,
    describe: () => describe(valueRef.value),
  })

  return fieldRef
}

export const isFieldValid = (...fields: FieldRef<any>[]) =>
  fields.every((field) => field.validate(field.value) === true)
