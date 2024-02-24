import type { ButtonProps } from '@/components'
import { AllowedFieldTypes, FieldRef, FieldValidator } from '@/utils/functions'
import { ref } from 'vue'
import { defineStore } from '../defineStore'

type ButtonConfig = { label?: string; buttonProps?: ButtonProps }

type GeneralGetter<T> = {
  messageHtml: string
  cancelValue?: T | null
  messageClass?: string
  /**
   * Se definido, chama esse metodo ao apertar enviar.
   * Esse metodo fica responsavel por chamar resolve
   */
  onSubmit?: (value: T, resolve: (value: any) => void) => void
}

type BooleanGetter = GeneralGetter<boolean> & {
  type: 'boolean'
  trueButton?: ButtonConfig
  falseButton?: ButtonConfig
}

type StringGetter = GeneralGetter<string> & {
  type: 'string'
  inputFieldName?: string
  initialValue?: string
  validator?: FieldValidator<string>
  submitButton?: ButtonConfig
}

type FieldsGetter = GeneralGetter<Record<string, AllowedFieldTypes>> & {
  type: 'fields'
  fields: FieldRef<any>[]
  autoFocus?: string
  submitButton?: ButtonConfig
}

type InputGetter = StringGetter | BooleanGetter | FieldsGetter

export const useInput = defineStore('input', () => {
  /** Current input getter in action */
  const currentInput = ref<
    | {
        resolve: (value: any) => void
        cancelValue: any
        getter: InputGetter
      }
    | undefined
  >(undefined)

  const makeResolve = (resolve: (value: any) => void) => (value: any) => {
    resolve(value)
    currentInput.value = undefined
  }

  return {
    currentInput,

    getStringInput: (inputGetter: Omit<StringGetter, 'type'>) =>
      new Promise<string>((resolve) => {
        currentInput.value = {
          resolve: makeResolve(resolve),
          cancelValue: inputGetter.cancelValue ?? '',
          getter: { ...inputGetter, type: 'string' },
        }
      }),

    getBooleanInput: (inputGetter: Omit<BooleanGetter, 'type'>) =>
      new Promise<boolean>((resolve) => {
        currentInput.value = {
          resolve: makeResolve(resolve),
          cancelValue: inputGetter.cancelValue ?? false,
          getter: { ...inputGetter, type: 'boolean' },
        }
      }),

    getFieldsInput: (inputGetter: Omit<FieldsGetter, 'type'>) =>
      new Promise<Record<string, unknown> | undefined>((resolve) => {
        currentInput.value = {
          resolve: makeResolve(resolve),
          cancelValue: inputGetter.cancelValue,
          getter: { ...inputGetter, type: 'fields' },
        }
      }),
  }
})
