import { ref } from 'vue'
import { fieldRef } from '../../../utils'

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

  /** Converte error do firebase para uma mensagem legivel */
  const getErrorForCode = (code: string) => {
    if (code == 'auth/invalid-email') return 'Email inválido'
    if (code == 'auth/user-disabled') return 'Esta conta está bloqueada'
    if (code == 'auth/user-not-found') return 'Email não encontrado'
    if (code == 'auth/email-already-in-use') return 'Email indisponível'
    if (code == 'auth/invalid-password') return 'Senha incorreta'
    return 'Inválido'
  }

  /** Mensagens de error para email invalido */
  const emailErrorFor = {
    invalid: getErrorForCode('auth/invalid-email'),
    inUse: getErrorForCode('auth/email-already-in-use'),
    inexistent: getErrorForCode('auth/user-not-found'),
  }

  /** Emails que ja foram tentados e registrados como invalidos */
  const invalidEmails = ref<invalidEmailsType>({
    invalid: [],
    inUse: [],
    inexistent: [],
  })

  /** Faz com que o campo de email fique invalido se tiver esse email */
  const invalidateEmail = (email: string, reason: keyof invalidEmailsType) => {
    invalidEmails.value[reason].push(email)

    return emailErrorFor[reason]
  }

  /** Se o codigo indicar um email invalido, chama invalidateEmail com o email fornecido */
  const maybeInvalidateEmail = (email: string, code: string) => {
    if (code == 'auth/invalid-email') invalidateEmail(email, 'invalid')
    if (code == 'auth/user-not-found') invalidateEmail(email, 'inexistent')
    if (code == 'auth/email-already-in-use') invalidateEmail(email, 'inUse')
  }

  /** Campo de email */
  const email = fieldRef<string>('email', {
    initialValue: '',
    localStoragePrefix: localStorageKey
      ? `${localStorageKey}__email`
      : undefined,
    validator: (newValue: string) => {
      if (/.+@.+\..+/.test(newValue) == false) return 'Email inválido'
      if (newValue.length > 100) return 'Muito longo'

      for (const reason in invalidEmails.value)
        if (
          invalidEmails.value[reason as keyof invalidEmailsType].includes(
            newValue
          )
        )
          return emailErrorFor[reason as keyof invalidEmailsType]

      return true
    },
  })

  /** Campo de senha */
  const password = fieldRef<string>('password', {
    initialValue: '',
    validator: (newValue: string) => {
      if (newValue.length < 6) return 'Mínimo de 6 caracteres'
      if (newValue.length > 100) return 'Muito longa'

      return true
    },
  })

  const matchesPassword = (value: string): string | true => {
    if (value == '' || value !== password.value) return 'Não corresponde'

    return true
  }

  /** Campo de confirmacao de senha */
  const passwordConfirmation = fieldRef<string>('passwordConfirmation', {
    initialValue: '',
    validator: matchesPassword,
  })

  /** Campo de apelido */
  const nickname = fieldRef<string>('apelido', {
    initialValue: '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (newValue.length > 100) return 'Muito longo'

      return true
    },
  })

  /** Campo de nome */
  const name = fieldRef<string>('name', {
    initialValue: '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (/.+ .+/.test(newValue) == false)
        return 'Forneça primeiro e último nome'
      if (newValue.length > 100) return 'Muito longo'

      return true
    },
  })

  /** Campo de sobre */
  const about = fieldRef<string>('sobre', {
    initialValue: '',
    validator: (newValue: string) =>
      newValue.length > 400 ? 'Muito longo' : true,
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
