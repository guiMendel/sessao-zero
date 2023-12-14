import { AutosaveStatus, useAutosaveStatus } from '@/stores'
import { FieldRef } from '@/utils/functions'
import { watch } from 'vue'

type AutosaveFormOptions = {
  /** Quantos ms deve fazer throttle nas chamadas de fieldRef.persist */
  throttleAmount?: number

  /** Quantos ms esperar antes de tentar novamente um persist que falhou */
  retryDelay?: number
}

export const useAutosaveForm = <T extends Record<string, FieldRef<any>>>(
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
  const fieldMap: Partial<{
    [fieldName in keyof T]: { timeout?: NodeJS.Timeout; persistId?: string }
  }> = {}

  /** Tenta um persist do field fornecido */
  const persist = (
    field: FieldRef<any>,
    fieldName: string,
    status = AutosaveStatus.Persisting
  ) => {
    if (field.persist == undefined) return

    const persistId = getId()

    fieldMap[fieldName]!.persistId = persistId

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

        setTimeout(() => {
          if (cleanedUp == false && fieldMap[fieldName]!.persistId == persistId)
            persist(field, fieldName, AutosaveStatus.Retrying)
        }, retryDelay)
      })

    trackPromise(promise, fieldId, status)
  }

  /** Se ja encerrou funcionamento */
  let cleanedUp = false

  // Se inscreve em cada campo
  for (const [fieldNameUntyped, field] of Object.entries(fields)) {
    const fieldName = fieldNameUntyped as keyof T

    fieldMap[fieldName] = {}

    // Sempre que mudar, executamos o persist
    watch(field, () => {
      if (cleanedUp || field.validate(field.value) != true) return

      if (throttleAmount == 0) {
        persist(field, fieldNameUntyped)
        return
      }

      if (fieldMap[fieldName]!.timeout)
        clearTimeout(fieldMap[fieldName]!.timeout)

      fieldMap[fieldName]!.timeout = setTimeout(() => {
        delete fieldMap[fieldName]!.timeout

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
      for (const props of Object.values(fieldMap))
        if (props?.timeout != undefined) clearTimeout(props.timeout)
    },
  }
}
