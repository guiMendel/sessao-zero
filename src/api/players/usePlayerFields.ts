import { fieldRef } from '@/utils/functions'
import { ref } from 'vue'
import { Player } from '.'

type UsePlayerFieldsOptions = {
  storageKey?: string
  initializeWith?: Player
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
    initialValue: initialPlayer?.email ?? '',
    localStoragePrefix: storageKey ? `${storageKey}__email` : undefined,
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
    describe: () => 'necessário para autenticação',

    persist: update && ((email) => update?.({ email })),
  })

  // TODO: continuar atualizando os campos aqui para usar update e initialPlayer
  // - usar esse novo form no CreatePlayer e no EditPlayer
  // - usar o EditPlayer no Player
  // - restringir para so mostrar o botao de editar e destruir se for o jogador logado
  // - implementar destruir o jogador

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

  /** Campo de apelido */
  const nickname = fieldRef<string>('nickname', {
    initialValue: initialPlayer?.nickname ?? '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (newValue.length > 12) return 'Muito longo'

      return true
    },
    describe: () => 'como seu perfil aparecerá aos outros',

    persist: update && ((nickname) => update?.({ nickname })),
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

  return {
    fields: {
      email,
      name,
      password,
      passwordConfirmation,
      about,
      nickname,
    },
    getErrorForCode,
    invalidateEmail,
    maybeInvalidateEmail,
  }
}
