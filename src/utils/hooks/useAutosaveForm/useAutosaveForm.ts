import { AutosaveStatus, useAutosaveStatus } from '@/stores'
import { watch } from 'vue'
import { FieldRef } from '../..'

type AutosaveFormOptions = {
  /** Quantos ms deve fazer throttle nas chamadas de fieldRef.persist */
  throttleAmount?: number

  /** Quantos ms esperar antes de tentar novamente um persist que falhou */
  retryDelay?: number
}

export const useAutosaveForm = <T extends Record<string, FieldRef>>(
  fields: T,
  options?: AutosaveFormOptions
): { fields: T; cleanup: () => void } => {
  const { retryDelay = 10000, throttleAmount = 1000 } = options ?? {}

  const { getId, forgetPromise, trackPromise } = useAutosaveStatus()

  /** O id deste hook */
  const hookId = getId()

  /** Gera um id para um campo */
  const getFieldId = (fieldName: string) => `${hookId}_${fieldName}`

  /** Controla o throttle de cada field */
  const fieldThrottles: Partial<{ [fieldName in keyof T]: NodeJS.Timeout }> = {}

  /** Tenta um persist do field fornecido */
  const persist = (
    field: FieldRef,
    fieldName: string,
    status = AutosaveStatus.Persisting
  ) => {
    if (field.persist == undefined) return

    /** Guarda o valor do campo neste momento */
    const fieldValue = field.value

    /** Guarda o id deste campo */
    const fieldId = getFieldId(fieldName)

    const promise = field
      .persist()
      // Na falha, atualiza o status para retrying e e tenta novamente
      .catch((error) => {
        console.error(
          `Falha ao atualizar campo ${fieldName as string} para ${fieldValue}`,
          error
        )

        if (cleanedUp == false)
          setTimeout(
            () => persist(field, fieldName, AutosaveStatus.Retrying),
            retryDelay
          )
      })

    trackPromise(promise, fieldId, status)
  }

  /** Se ja encerrou funcionamento */
  let cleanedUp = false

  // Se inscreve em cada campo
  for (const [fieldNameUntyped, field] of Object.entries(fields)) {
    const fieldName = fieldNameUntyped as keyof T

    // Sempre que mudar, executamos o persist
    watch(field, () => {
      if (cleanedUp || field.validate(field.value) != true) return

      if (throttleAmount == 0) {
        persist(field, fieldNameUntyped)
        return
      }

      if (fieldThrottles[fieldName] != undefined)
        clearTimeout(fieldThrottles[fieldName])

      fieldThrottles[fieldName] = setTimeout(() => {
        fieldThrottles[fieldName] = undefined

        persist(field, fieldNameUntyped)
      }, throttleAmount)
    })
  }

  return {
    fields,

    cleanup: () => {
      cleanedUp = true

      // Esquece todas as promessas
      for (const fieldName in fields) forgetPromise(getFieldId(fieldName))

      // Cancela todas as atualizaçoes agendadas
      for (const throttled of Object.values(fieldThrottles))
        if (throttled != undefined) clearTimeout(throttled)
    },
  }
}
