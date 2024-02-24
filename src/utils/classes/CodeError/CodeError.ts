import { FirebaseError } from 'firebase/app'

export type CodeErrorTypes =
  // Local
  | 'local/unknown'
  | 'local/nickname-taken'
  | 'local/require-auth'
  | 'local/require-guild'
  // Firebase Auth
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/email-already-in-use'
  | 'auth/invalid-password'

export const errorCodeToMessage: Record<CodeErrorTypes, string> = {
  // Local
  'local/unknown': 'Erro, tente novamente mais tarde',
  'local/nickname-taken': 'Apelido em uso',
  'local/require-auth': 'Precisa estar logado',
  'local/require-guild': 'Precisa selecionar uma guilda antes',
  // Firebase Auth
  'auth/invalid-email': 'Email inválido',
  'auth/user-disabled': 'Esta conta está bloqueada',
  'auth/user-not-found': 'Email não encontrado',
  'auth/email-already-in-use': 'Email indisponível',
  'auth/invalid-password': 'Senha incorreta',
}

export class CodeError {
  public code: CodeErrorTypes
  public message: string

  constructor(code: CodeErrorTypes, message?: string) {
    this.code = code
    this.message = message ?? errorCodeToMessage[code]
  }
}

export const intoCodeError = (error: any): CodeError => {
  if (error instanceof CodeError) return error

  if (error instanceof FirebaseError) {
    if (error.code in errorCodeToMessage)
      return new CodeError(error.code as CodeErrorTypes)

    console.warn(
      'Falha em converter erro do firebase em CodeError: erro desconhecido',
      error
    )

    return new CodeError('local/unknown')
  }

  if (typeof error === 'string') return new CodeError('local/unknown', error)

  return new CodeError('local/unknown')
}
