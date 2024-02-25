import { fieldRef, fileFieldRef } from '@/utils/functions'
import { Adventure } from '.'
import { HalfResource } from '@/firevase/resources'
import { Vase } from '..'
import { deleteFile, downloadFile, setFile } from '@/firevase/files'

type UseAdventureFieldsOptions = {
  sessionStoragePrefix?: string
  initializeWith?: HalfResource<Vase, 'adventures'>
  /** Method that we can use to update an adventure with */
  update?: (newValue: Partial<Adventure>) => Promise<void>
}

/** Retorna uma colecao de campos uteis para coletar dados do jogador
 * @param localStorageKey se fornecido, persiste os campos em localstorage
 */
export const useAdventureFields = ({
  initializeWith: initialAdventure,
  sessionStoragePrefix,
  update,
}: UseAdventureFieldsOptions) => {
  /** Campo de nome */
  const name = fieldRef<string>('name', {
    initialValue: initialAdventure?.name ?? '',
    validator: (newValue: string) => {
      if (newValue.length < 3) return 'Mínimo de 3 caracteres'
      if (newValue.length > 100) return 'Muito longo'

      return true
    },
    sessionStoragePrefix,
    persist: update && ((name) => update({ name })),
  })

  /** Campo de descrição */
  const description = fieldRef<string>(
    { name: 'descrição', type: 'multi-line' },
    {
      initialValue: initialAdventure?.description ?? '',
      sessionStoragePrefix,
      validator: (newValue: string) =>
        newValue.length > 800 ? 'Muito longo' : true,
      describe: () => 'apresente e torne sua aventura interessante!',
      persist: update && ((description) => update({ description })),
    }
  )

  /** Tamanho maximo de arquivos, em bytes */
  const maxFileSize = 200 * 1000

  /** Imagem da aventura */
  const banner = fileFieldRef('capa', {
    initializer: initialAdventure
      ? downloadFile(initialAdventure, 'banner')
      : undefined,
    validator: (newFile) =>
      newFile && newFile.size > maxFileSize ? 'Muito grande' : true,
    persist:
      initialAdventure &&
      update &&
      (async (newValue) => {
        newValue
          ? setFile(initialAdventure, 'banner', newValue)
          : deleteFile(initialAdventure, 'banner')
      }),
  })

  const shouldLimitPlayers = fieldRef<boolean>(
    { name: 'limitar vagas', type: 'toggle' },
    {
      initialValue:
        (initialAdventure && initialAdventure.playerLimit > 0) ?? false,
      sessionStoragePrefix,
      persist:
        update &&
        ((shouldLimit) =>
          update({ playerLimit: shouldLimit ? playerLimit.value : -1 })),
    }
  )

  /** Limite de jogadores */
  const playerLimit = fieldRef<number>(
    { name: 'limite de jogadores', type: 'number', min: 1 },
    {
      initialValue: Math.max(initialAdventure?.playerLimit ?? 5, 1),
      sessionStoragePrefix,
      validator: (newValue: number) =>
        newValue <= 0
          ? 'Para impedir novas entradas, tranque a aventura'
          : true,
      describe: () =>
        'quando atingir o limite, novos jogadores não poderão entrar',
      persist: update && ((playerLimit) => update({ playerLimit })),
    }
  )

  /** Se a aventura aceita novos jogadores */
  const open = fieldRef<boolean>(
    { name: 'aceita inscrições', type: 'toggle' },
    {
      initialValue: initialAdventure?.open ?? true,
      sessionStoragePrefix,
      describe: (value) =>
        value
          ? 'sua aventura aceitará novos jogadores'
          : 'sua aventurá não aceitará jogadores ainda',
      persist: update && ((open) => update({ open })),
    }
  )

  /** Se a aventura requer admissão */
  const requireAdmission = fieldRef<boolean>(
    { name: 'requer admissão', type: 'toggle' },
    {
      initialValue: initialAdventure?.requireAdmission ?? false,
      sessionStoragePrefix,
      describe: (value) =>
        value
          ? 'jogadores enviam solicitações para entrar na aventura'
          : 'jogadores podem entrar diretamente',
      persist: update && ((requireAdmission) => update({ requireAdmission })),
    }
  )

  return {
    name,
    description,
    playerLimit,
    open,
    requireAdmission,
    shouldLimitPlayers,
    banner,
  }
}
