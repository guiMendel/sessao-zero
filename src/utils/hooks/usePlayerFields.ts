import { ref, type Ref, watch } from 'vue'
import { Field } from '../../types/Field.interface'

export const usePlayerFields = () => {
  /** Categorias de email invalidos */
  type invalidEmailsType = {
    invalid: string[]
    inUse: string[]
    inexistent: string[]
  }

  // Converts a login error code to a human readable message
  const getErrorForCode = (code: string) => {
    if (code == 'auth/invalid-email') return 'Email inválido'
    if (code == 'auth/user-disabled') return 'Esta conta está bloqueada'
    if (code == 'auth/user-not-found') return 'Email não encontrado'
    if (code == 'auth/email-already-in-use') return 'Email indisponível'
    if (code == 'auth/invalid-password') return 'Senha incorreta'
    return 'Inválido'
  }

  // Errors for invalid email types
  const errorFor = {
    invalid: getErrorForCode('auth/invalid-email'),
    inUse: getErrorForCode('auth/email-already-in-use'),
    inexistent: getErrorForCode('auth/user-not-found'),
  }

  // Invalid emails
  const invalidEmails = ref<invalidEmailsType>({
    invalid: [],
    inUse: [],
    inexistent: [],
  })

  // Set an email as invalid
  const invalidateEmail = (email: string, reason: keyof invalidEmailsType) => {
    invalidEmails.value[reason].push(email)

    return errorFor[reason]
  }

  // Cria um campo com o nome e o validador fornecido
  const makeField = (
    name: Field['name'],
    validator: Field['validate']
  ): Ref<Field> =>
    ref({
      name,
      value: '',
      valid: false,
      validate: validator,
    })

  /** Campo de email */
  const email = makeField('email', (newValue: string) => {
    if (/.+@.+\..+/.test(newValue) == false) return 'Email inválido'
    if (newValue.length > 100) return 'Muito longo'

    for (const reason in invalidEmails.value)
      if (
        invalidEmails.value[reason as keyof invalidEmailsType].includes(
          newValue
        )
      )
        return errorFor[reason as keyof invalidEmailsType]

    return true
  })

  /** Campo de senha */
  const password = makeField('senha', (newValue: string) => {
    if (newValue.length < 6) return 'Mínimo de 6 caracteres'
    if (newValue.length > 100) return 'Muito longa'

    return true
  })

  const matchesPassword = (value: string): string | true => {
    if (value == '' || value !== password.value.value)
      return "Doesn't match password"

    return true
  }

  /** Campo de confirmacao de senha */
  const passwordConfirmation = makeField('confirmação', matchesPassword)

  // Keep confirmation synced to password
  watch(
    password,
    () =>
      (passwordConfirmation.value.valid =
        matchesPassword(passwordConfirmation.value.value) === true)
  )

  /** Campo de apelido */
  const nickname = makeField('apelido', (newValue: string) => {
    if (newValue.length < 3) return 'Mínimo de 3 caracteres'
    if (newValue.length > 100) return 'Muito longo'

    return true
  })

  /** Campo de nome */
  const name = makeField('nome', (newValue: string) => {
    if (newValue.length < 3) return 'Mínimo de 3 caracteres'
    if (/.+ .+/.test(newValue) == false) return 'Forneça primeiro e último nome'
    if (newValue.length > 100) return 'Muito longo'

    return true
  })

  /** Campo de sobre */
  const about = makeField('sobre', (newValue: string) => {
    if (newValue.length > 400) return 'Muito longo'

    return true
  })

  return {
    email,
    invalidateEmail,
    name,
    password,
    passwordConfirmation,
    about,
    nickname,
    getErrorForCode,
  }
}