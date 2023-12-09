import { Ref, ref, watch } from 'vue'
import { FieldRef } from '../..'

type AutosaveFormOptions = {
  /** Quantos ms deve fazer throttle nas chamadas de fieldRef.persist */
  throttleAmount?: number

  /** Quantos ms esperar antes de tentar novamente um persist que falhou */
  retryDelay?: number

  /** Quantos ms deve manter o estado de sucesos antes de voltar para idle */
  successStatusDuration?: number
}

/** Representa os possiveis estados que o autosave pode assumir */
export enum AutosaveStatus {
  /** Nao esta fazendo nada */
  Idle,
  /** Ja chamou persist para 1 ou mais campos e esta esperando um resultado */
  Persisting,
  /** 1 ou mais campos falharam ao persistir, e o autosave esta tentando novamente */
  Retrying,
  /** Todos os campos foram persistidos com sucesso */
  Success,
}

export const useAutosaveForm = <T extends Record<string, FieldRef>>(
  fields: T,
  options?: AutosaveFormOptions
): { fields: T; status: Ref<AutosaveStatus>; cleanup: () => void } => {
  const {
    retryDelay = 10000,
    throttleAmount = 1000,
    successStatusDuration = 3000,
  } = options ?? {}

  /** Guarda o atual status do autosave */
  const status = ref(AutosaveStatus.Idle)

  /** Controla o throttle de cada field */
  const fieldThrottles: Partial<{ [fieldName in keyof T]: NodeJS.Timeout }> = {}

  /** Registra todas as promessas de persist que estao sendo aguardadas */
  let persistPromises: Record<
    number,
    { promise: Promise<void>; status: AutosaveStatus }
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

  /** Tenta um persist do field fornecido */
  const persist = (
    field: FieldRef,
    promiseId: number,
    fieldName: string,
    fieldValue: string,
    status = AutosaveStatus.Persisting
  ) => {
    if (field.persist == undefined) return

    const promise = field
      .persist()
      // No sucesso, atualiza o status para sucesso pela duraçao configrada e entao remove essa promessa
      .then(() => {
        persistPromises[promiseId].status = AutosaveStatus.Success
        updateStatus()

        setTimeout(() => {
          delete persistPromises[promiseId]
          updateStatus()
        }, successStatusDuration)
      })
      // Na falha, atualiza o status para retrying e e tenta novamente
      .catch((error) => {
        console.error(
          `Falha ao atualizar campo ${fieldName as string} para ${fieldValue}`,
          error
        )

        persistPromises[promiseId].status = AutosaveStatus.Retrying
        updateStatus()

        if (cleanedUp == false)
          setTimeout(
            () =>
              persist(
                field,
                promiseId,
                fieldName,
                fieldValue,
                AutosaveStatus.Retrying
              ),
            retryDelay
          )
      })

    persistPromises[promiseId] = { promise, status }
    updateStatus()
  }

  /** Se ja encerrou funcionamento */
  let cleanedUp = false

  // Se inscreve em cada campo
  for (const [fieldNameUntyped, field] of Object.entries(fields)) {
    const fieldName = fieldNameUntyped as keyof T

    watch(field, (fieldValue) => {
      if (cleanedUp) return

      if (throttleAmount == 0) {
        persist(field, nextId++, fieldName as string, fieldValue)
        return
      }

      if (fieldThrottles[fieldName] != undefined)
        clearTimeout(fieldThrottles[fieldName])

      fieldThrottles[fieldName] = setTimeout(() => {
        fieldThrottles[fieldName] = undefined

        // Sempre que mudar, executamos o persist
        persist(field, nextId++, fieldName as string, fieldValue)
      }, throttleAmount)
    })
  }

  return {
    fields,
    status,
    cleanup: () => {
      cleanedUp = true

      persistPromises = {}
      updateStatus()

      for (const throttled of Object.values(fieldThrottles))
        if (throttled != undefined) clearTimeout(throttled)
    },
  }
}
