import type { ButtonProps } from '@/components'
import { FieldValidator } from '@/utils/functions'
import { ref } from 'vue'
import { defineStore } from '../defineStore'

type AllowedInputTypes = string | boolean

type ButtonConfig = { label?: string; buttonProps?: ButtonProps }

type GeneralGetter<T extends AllowedInputTypes> = {
  messageHtml: string
  cancelValue?: T
  messageClass?: string
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

type InputGetter = StringGetter | BooleanGetter

export const useInput = defineStore('input', () => {
  /** Current input getter in action */
  const currentInput = ref<
    | {
        resolve: (value: AllowedInputTypes) => void
        cancelValue: AllowedInputTypes
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
  }
})
