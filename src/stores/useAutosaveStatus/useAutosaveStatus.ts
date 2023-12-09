import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Representa os possiveis estados que o autosave pode assumir */
export enum AutosaveStatus {
  /** Nao esta fazendo nada */
  Idle = 'idle',
  /** Ja chamou persist para 1 ou mais campos e esta esperando um resultado */
  Persisting = 'persisting',
  /** 1 ou mais campos falharam ao persistir, e o autosave esta tentando novamente */
  Retrying = 'retrying',
  /** Todos os campos foram persistidos com sucesso */
  Success = 'success',
}

export const useAutosaveStatus = defineStore('autosave-status', () => {
  /** Quantos ms deve manter o estado de sucesos antes de voltar para idle */
  const successStatusDuration = ref(3000)

  /** Guarda o atual status do autosave */
  const status = ref(AutosaveStatus.Idle)

  /** Registra todas as promessas de persist que estao sendo aguardadas */
  let persistPromises: Record<
    string,
    { promise: Promise<unknown>; status: AutosaveStatus }
  > = {}

  /** Gera ids para o objeto persistPromises */
  let nextId = 0

  /** Atualiza o status com base no estado das promises */
  const updateStatus = () => {
    const promises = Object.values(persistPromises)

    if (promises.length == 0) {
      status.value = AutosaveStatus.Idle
      return
    }

    if (promises.some(({ status }) => status == AutosaveStatus.Retrying)) {
      status.value = AutosaveStatus.Retrying
      return
    }

    if (promises.every(({ status }) => status == AutosaveStatus.Success)) {
      status.value = AutosaveStatus.Success
      return
    }

    status.value = AutosaveStatus.Persisting
  }

  return {
    /** O status atual do autosave */
    status,

    /** Retorna numa nova string sempre que for chamado */
    getId: () => (nextId++).toString(),

    /** Remove a promessa registrada com o id fornecido */
    forgetPromise: (promiseId: string) => {
      delete persistPromises[promiseId]
      updateStatus()
    },

    successStatusDuration,

    /** Adiciona essa promessa a lista de promessas utilizadas para calcular o status */
    trackPromise: (
      promise: Promise<unknown>,
      promiseId: string,
      status = AutosaveStatus.Persisting
    ) => {
      persistPromises[promiseId] = {
        promise,
        status,
      }
      updateStatus()

      promise
        // No sucesso, atualiza o status para sucesso pela duraçao configrada e entao remove essa promessa
        .then(() => {
          persistPromises[promiseId].status = AutosaveStatus.Success
          updateStatus()

          setTimeout(() => {
            delete persistPromises[promiseId]
            updateStatus()
          }, successStatusDuration.value)
        })
        // Na falha, atualiza o status para retrying
        .catch(() => {
          persistPromises[promiseId].status = AutosaveStatus.Retrying
          updateStatus()
        })
    },
  }
})
