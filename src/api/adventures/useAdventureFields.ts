import { fieldRef } from '@/utils/functions'

/** Retorna uma colecao de campos uteis para coletar dados do jogador
 * @param localStorageKey se fornecido, persiste os campos em localstorage
 */
export const useAdventureFields = (sessionStoragePrefix?: string) => {
  /** Campo de nome */
  const name = fieldRef<string>('name', {
    initialValue: '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (newValue.length > 100) return 'Muito longo'

      return true
    },
    sessionStoragePrefix,
  })

  /** Campo de descrição */
  const description = fieldRef<string>('descrição', {
    initialValue: '',
    sessionStoragePrefix,
    validator: (newValue: string) =>
      newValue.length > 400 ? 'Muito longo' : true,
  })

  /** Limite de jogadores */
  const playerLimit = fieldRef<number>('limite de jogadores', {
    initialValue: 5,
    sessionStoragePrefix,
    validator: (newValue: number) =>
      newValue <= 0 ? 'Para impedir novas entradas, tranque a aventura' : true,
  })

  /** Se a aventura aceita novos jogadores */
  const open = fieldRef<boolean>('aceita inscrições', {
    initialValue: true,
    sessionStoragePrefix,
  })

  /** Se a aventura requer admissão */
  const requireAdmission = fieldRef<boolean>('requer admissão', {
    initialValue: false,
    sessionStoragePrefix,
  })

  return {
    name,
    description,
    playerLimit,
    open,
    requireAdmission,
  }
}
