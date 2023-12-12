import { useLocalStorage } from '@vueuse/core'
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

type FieldOptions<T extends AllowedFieldTypes> = {
  /** O valor inicial */
  initialValue: T

  /** Permite validar o input */
  validator?: FieldValidator<T>

  /** Se fornecido, utiliza a chave de LS `${localStoragePrefix}_${name}` para armazenar o valor */
  localStoragePrefix?: string

  /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
  persist?: (value: T) => Promise<void>
}

export type FieldRef<T extends AllowedFieldTypes> = Ref<T> & {
  /** O nome deste campo */
  name: string

  /** Define como validar o campo */
  validate: FieldValidator<T>

  /** Uma funçao que salva o valor atual deste ref no backend e retorna uma promessa do resultado */
  persist?: () => Promise<void>
}

/** Gera um FieldRef */
export function fieldRef<T extends AllowedFieldTypes>(
  name: string,
  options: FieldOptions<T>
): FieldRef<T> {
  const { initialValue, localStoragePrefix, validator, persist } = {
    validator: () => true as const,
    localStoragePrefix: undefined,
    persist: undefined,
    ...options,
  }

  const valueRef = (
    localStoragePrefix != undefined
      ? useLocalStorage<T>(`${localStoragePrefix}_${name}`, initialValue)
      : ref<T>(initialValue)
  ) as Ref<T>

  const fieldRef: FieldRef<T> = Object.assign(valueRef, {
    name,
    validate: validator,
    persist: persist ? () => persist(valueRef.value) : undefined,
  })

  return fieldRef
}

export const isFieldValid = (...fields: FieldRef<any>[]) =>
  fields.every((field) => field.validate(field.value) === true)
