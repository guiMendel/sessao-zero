import { useLocalStorage } from '@vueuse/core'
import { Ref, ref, watch } from 'vue'

/** Uma funcao que valida um input fornecido por um usuario.
 * @param value o valor fornecido.
 * @returns true se for um valor valido, uma mensagem de error se nao for.
 */
export type FieldValidator = (value: string) => true | string

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

/** Cria um field ref com um validator */
export function fieldRef(name: string, validator: FieldValidator): FieldRef

/** Permite passar opcoes especificas para o validator */
export function fieldRef(name: string, options?: FieldOptions): FieldRef

/** Gera um FieldRef */
export function fieldRef(
  name: string,
  options: FieldOptions | FieldValidator = {}
): FieldRef {
  const { initialValue, localStoragePrefix, validator } =
    typeof options === 'object'
      ? options
      : { validator: options, localStoragePrefix: undefined, initialValue: '' }

  const valueRef: Ref<string> =
    localStoragePrefix != undefined
      ? useLocalStorage<string>(
          `${localStoragePrefix}_${name}`,
          initialValue ?? ''
        )
      : ref<string>(initialValue ?? '')

  // Inicializa a validacao
  const validate = validator ?? (() => true)

  const isValid = validate(valueRef.value)

  const fieldRef = Object.assign(valueRef, {
    name,
    validate,
    valid: isValid === true,
    validationMessage: isValid === true ? '' : isValid,
  })

  // Sincroniza o estado de valid
  if (validator != undefined)
    watch(valueRef, (newValue) => {
      const isValid = validate(newValue)
      fieldRef.valid = isValid === true
      fieldRef.validationMessage = isValid === true ? '' : isValid
    })

  return fieldRef
}
