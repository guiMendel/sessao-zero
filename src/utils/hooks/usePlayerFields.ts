import { Field } from '@/types/Field.interface'
import { useLocalStorage } from '@vueuse/core'
import { ref, watch, type Ref } from 'vue'

/** Retorna uma colecao de campos uteis para coletar dados do jogador
 * @param localStorageKey se fornecido, persiste os campos em localstorage
 */
export const usePlayerFields = (localStorageKey?: string) => {
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

  /** Faz com que o campo de email fique invalido se tiver esse email */
  const invalidateEmail = (email: string, reason: keyof invalidEmailsType) => {
    invalidEmails.value[reason].push(email)

    return errorFor[reason]
  }

  /** Se o codigo indicar um email invalido, chama invalidateEmail com o email fornecido */
  const maybeInvalidateEmail = (email: string, code: string) => {
    if (code == 'auth/invalid-email') invalidateEmail(email, 'invalid')
    if (code == 'auth/user-not-found') invalidateEmail(email, 'inexistent')
    if (code == 'auth/email-already-in-use') invalidateEmail(email, 'inUse')
  }

  // Cria um campo com o nome e o validador fornecido
  const makeField = (
    name: Field['name'],
    validator: Field['validate'],
    useLocalIfProvided = true
  ): Ref<Field> => {
    const defaults = {
      name,
      value: '',
      valid: false,
      validate: validator,
    }

    if (localStorageKey && useLocalIfProvided)
      return useLocalStorage(`${localStorageKey}--field-${name}`, defaults, {
        // listenToStorageChanges: true,
        mergeDefaults: (storage, defaults) => ({
          ...defaults,
          value: storage.value,
        }),
        listenToStorageChanges: false,
      })

    return ref(defaults)
  }

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
  const password = makeField(
    'senha',
    (newValue: string) => {
      if (newValue.length < 6) return 'Mínimo de 6 caracteres'
      if (newValue.length > 100) return 'Muito longa'

      return true
    },
    false
  )

  const matchesPassword = (value: string): string | true => {
    if (value == '' || value !== password.value.value) return 'Não corresponde'

    return true
  }

  /** Campo de confirmacao de senha */
  const passwordConfirmation = makeField(
    'confirmarSenha',
    matchesPassword,
    false
  )

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
    maybeInvalidateEmail,
    name,
    password,
    passwordConfirmation,
    about,
    nickname,
    getErrorForCode,
  }
}
