import { AutosaveResult, AutosaveStatus, useAutosaveStatus } from '@/stores'
import { CodeError } from '@/utils/classes'
import { FieldRef } from '@/utils/functions'
import { onBeforeUnmount, watch } from 'vue'

/** Quanto tempo multiplicar o delay a cada tentativa */
const retryMultiplier = 2

export type HandleAutosaveError = (
  error: CodeError,
  field: FieldRef<any>,
  currentFieldValue: any
) => AutosaveResult | 'retry'

type AutosaveFormOptions = {
  /** Quantos ms deve fazer throttle nas chamadas de fieldRef.persist */
  throttleAmount?: number

  /** Quantos ms esperar antes de tentar novamente um persist que falhou */
  retryDelay?: number

  /** Permite lidar com o erro. Deve retornar true se lidou, false do contrario. Se retornar false,
   * o persist tentara novamente
   */
  handleError?: HandleAutosaveError
}

export const useAutosaveForm = <T extends Record<string, FieldRef<any>>>(
  fields: T,
  options?: AutosaveFormOptions
): { fields: T; cleanup: () => void } => {
  const {
    retryDelay = 10000,
    throttleAmount = 1000,
    handleError = () => 'retry' as const,
  } = options ?? {}

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
    status = AutosaveStatus.Persisting,
    recursionRetryDelay = retryDelay
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
      .then(() => 'success' as const)
      // Na falha, atualiza o status para retrying e tenta novamente
      .catch((error) => {
        const result = handleError(error, field, fieldValue)

        if (result !== 'retry') return result

        console.error(
          `Falha ao atualizar campo ${fieldName as string} para ${fieldValue}`,
          error
        )

        setTimeout(() => {
          if (cleanedUp == false && fieldMap[fieldName]!.persistId == persistId)
            persist(
              field,
              fieldName,
              AutosaveStatus.Retrying,
              recursionRetryDelay * retryMultiplier
            )
        }, recursionRetryDelay)

        throw error
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
      if (
        cleanedUp ||
        field.validate(field.value) != true ||
        field.loaded == false
      )
        return

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

  const cleanup = () => {
    if (cleanedUp) return

    cleanedUp = true

    // Esquece todas as promessas
    for (const fieldName in fields) forgetPromise(getFieldId(fieldName))

    // Cancela todas as atualizaçoes agendadas
    for (const props of Object.values(fieldMap))
      if (props?.timeout != undefined) clearTimeout(props.timeout)
  }

  onBeforeUnmount(cleanup)

  return {
    fields,

    cleanup,
  }
}
