import { useLocalStorage } from '@vueuse/core'
import { Ref, ref, watch } from 'vue'

/** Uma funcao que valida um input fornecido por um usuario.
 * @param value o valor fornecido.
 * @returns true se for um valor valido, uma mensagem de error se nao for.
 */
export type FieldValidator = (value: string) => {
  valid: boolean
  message: string
}

type FieldOptions = {
  /** Permite validar o input */
  validator?: FieldValidator

  /** O valor inicial */
  initialValue?: string

  /** Se fornecido, utiliza a chave de LS `${localStoragePrefix}_${name}` para armazenar o valor */
  localStoragePrefix?: string
}

export type FieldRef = Ref<string> & {
  /** O nome deste campo */
  readonly name: string

  /** Se o campo tem um valor valido */
  valid: boolean

  /** Uma mensagem que explica o atual estado de valid */
  validationMessage: string

  /** Define como validar o campo */
  validate: FieldValidator
}

/** Gera um FieldRef */
export const fieldRef = (
  name: string,
  { initialValue, localStoragePrefix, validator }: FieldOptions = {}
): FieldRef => {
  const valueRef: Ref<string> =
    localStoragePrefix != undefined
      ? useLocalStorage<string>(
          `${localStoragePrefix}_${name}`,
          initialValue ?? ''
        )
      : ref<string>(initialValue ?? '')

  // Inicializa a validacao
  const validate = validator ?? (() => ({ valid: true, message: '' }))

  const { message: validationMessage, valid } = validate(valueRef.value)

  const fieldRef = Object.assign(valueRef, {
    name,
    validate,
    valid,
    validationMessage,
  })

  // Sincroniza o estado de valid
  if (validator != undefined)
    watch(valueRef, (newValue) => {
      const { message, valid } = validate(newValue)
      fieldRef.valid = valid
      fieldRef.validationMessage = message
    })

  return fieldRef
}
