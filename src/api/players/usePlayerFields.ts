import { useAlert } from '@/stores'
import { CodeErrorTypes, errorCodeToMessage } from '@/utils/classes'
import { fieldRef } from '@/utils/functions'
import { HandleAutosaveError } from '@/utils/hooks'
import { ref } from 'vue'
import { Player } from '.'

type UsePlayerFieldsOptions = {
  storageKey?: string
  initializeWith?: Partial<Player>
  /** Method that we can use to update an adventure with */
  update?: (newValue: Partial<Player>) => Promise<void>
}

/** Retorna uma colecao de campos uteis para coletar dados do jogador
 * @param storageKey se fornecido, persiste os campos em localstorage
 */
export const usePlayerFields = ({
  initializeWith: initialPlayer,
  storageKey,
  update,
}: UsePlayerFieldsOptions) => {
  /** Emails que ja foram tentados e registrados como invalidos */
  const invalidEmails = ref<
    Record<
      Extract<
        CodeErrorTypes,
        | 'auth/invalid-email'
        | 'auth/user-not-found'
        | 'auth/email-already-in-use'
      >,
      string[]
    >
  >({
    'auth/email-already-in-use': [],
    'auth/invalid-email': [],
    'auth/user-not-found': [],
  })

  /** Se o codigo indicar um email invalido, chama invalidateEmail com o email fornecido */
  const maybeInvalidateEmail = (email: string, code: string) => {
    if (
      code == 'auth/invalid-email' ||
      code == 'auth/user-not-found' ||
      code == 'auth/email-already-in-use'
    ) {
      invalidEmails.value[code].push(email)
      return true
    }

    return false
  }

  /** Campo de email */
  const email = fieldRef<string>('email', {
    initialValue: initialPlayer?.email ?? '',
    localStoragePrefix: storageKey ? `${storageKey}__email` : undefined,
    validator: (newValue: string) => {
      if (/.+@.+\..+/.test(newValue) == false) return 'Email inválido'
      if (newValue.length > 100) return 'Muito longo'

      for (const reason in invalidEmails.value) {
        const code = reason as keyof (typeof invalidEmails)['value']

        if (invalidEmails.value[code].includes(newValue))
          return errorCodeToMessage[code]
      }

      return true
    },
    describe: () => 'necessário para autenticação',

    persist: update && ((email) => update?.({ email })),
  })

  /** Apelidos em uso */
  const invalidNicknames = ref<string[]>([])

  /** Adiciona um apelido a lista de apelidos invalidos por estarem em uso */
  const maybeInvalidateNickname = (nickname: string, code: string) => {
    if (code === 'local/nickname-taken') {
      invalidNicknames.value.push(nickname)
      return true
    }

    return false
  }

  /** Campo de apelido */
  const nickname = fieldRef<string>('nickname', {
    initialValue: initialPlayer?.nickname ?? '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (newValue.length > 12) return 'Muito longo'
      if (invalidNicknames.value.includes(newValue)) return 'Apelido em uso'

      return true
    },
    describe: () => 'como seu perfil aparecerá aos outros',

    persist: update && ((nickname) => update({ nickname })),
  })

  /** Campo de senha */
  const password = fieldRef<string>('password', {
    initialValue: initialPlayer?.password ?? '',
    validator: (newValue: string) => {
      if (newValue.length < 6) return 'Mínimo de 6 caracteres'
      if (newValue.length > 100) return 'Muito longa'

      return true
    },

    persist: update && ((password) => update?.({ password })),
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

  /** Campo de nome */
  const name = fieldRef<string>('name', {
    initialValue: initialPlayer?.name ?? '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (/.+ .+/.test(newValue) == false)
        return 'Forneça primeiro e último nome'
      if (newValue.length > 100) return 'Muito longo'

      return true
    },
    describe: () => 'como você se chama',

    persist: update && ((name) => update?.({ name })),
  })

  /** Campo de sobre */
  const about = fieldRef<string>(
    { name: 'sobre', type: 'multi-line' },
    {
      initialValue: initialPlayer?.about ?? '',
      validator: (newValue: string) =>
        newValue.length > 400 ? 'Muito longo' : true,
      describe: () => 'compartilhe um pouco sobre você com a comunidade!',

      persist: update && ((about) => update?.({ about })),
    }
  )

  const { alert } = useAlert()

  const handleAutosaveError: HandleAutosaveError = (
    { code, message },
    _,
    currentValue
  ) => {
    alert('error', message)

    if (
      maybeInvalidateEmail(currentValue, code) ||
      maybeInvalidateNickname(currentValue, code)
    )
      return 'aborted'

    return 'retry'
  }

  return {
    fields: {
      email,
      name,
      password,
      passwordConfirmation,
      about,
      nickname,
    },
    maybeInvalidateEmail,
    maybeInvalidateNickname,
    handleAutosaveError,
  }
}
