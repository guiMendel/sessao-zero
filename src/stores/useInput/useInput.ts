import type { ButtonProps } from '@/components'
import { FieldValidator } from '@/utils/functions'
import { ref } from 'vue'
import { defineStore } from '../defineStore'

type AllowedInputTypes = string | boolean

type ButtonConfig = { label?: string; buttonProps?: ButtonProps }

type GeneralGetter = {
  messageHtml: string
  cancellable: boolean
  messageClass?: string
}

type BooleanGetter = GeneralGetter & {
  type: 'boolean'
  trueButton?: ButtonConfig
  falseButton?: ButtonConfig
}

type StringGetter = GeneralGetter & {
  type: 'string'
  inputFieldName?: string
  initialValue?: string
  validator?: FieldValidator<string>
  submitButton?: ButtonConfig
}

type InputGetter = StringGetter | BooleanGetter

export const cancelMessage = 'Usuario cancelou'

export const useInput = defineStore('input', () => {
  /** Current input getter in action */
  const currentInput = ref<
    | {
        resolve: (value: AllowedInputTypes) => void
        reject?: () => void
        getter: InputGetter
      }
    | undefined
  >(undefined)

  const makeResolve = (resolve: (value: any) => void) => (value: any) => {
    resolve(value)
    currentInput.value = undefined
  }

  const makeReject = (cancellable: boolean, reject: (reason: string) => void) =>
    cancellable
      ? () => {
          reject(cancelMessage)
          currentInput.value = undefined
        }
      : undefined

  return {
    currentInput,

    getStringInput: (inputGetter: Omit<StringGetter, 'type'>) =>
      new Promise<string>((resolve, reject) => {
        currentInput.value = {
          resolve: makeResolve(resolve),
          reject: makeReject(inputGetter.cancellable, reject),
          getter: { ...inputGetter, type: 'string' },
        }
      }),

    getBooleanInput: (inputGetter: Omit<BooleanGetter, 'type'>) =>
      new Promise<boolean>((resolve, reject) => {
        currentInput.value = {
          resolve: makeResolve(resolve),
          reject: makeReject(inputGetter.cancellable, reject),
          getter: { ...inputGetter, type: 'boolean' },
        }
      }),
  }
})
