import { useCurrentPlayer } from '@/api/players'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, getFromStorage, setInStorage } from '@/utils/functions'
import { encrypt } from '@/utils/functions/encryption'
import { useRoute } from 'vue-router'
import { useGuild } from '..'
import { useAlert, useInput } from '@/stores'
import { addRelation } from '@/firevase/relations'
import { vase } from '@/api'

/** Por quanto tempo os convites devem ser validos */
const invitationLifetimeDays = 2

type Invitation = {
  token: string
  guildId: string
}

const isValidDate = (date: Date) =>
  date &&
  Object.prototype.toString.call(date) === '[object Date]' &&
  // @ts-ignore
  !isNaN(date)

export const generateLink = (
  guildId: string,
  { fullPath, overrideToken }: { fullPath: boolean; overrideToken?: string }
) => {
  const today = new Date()

  return `${fullPath ? window.location.origin : ''}/${guildId}/${
    overrideToken ??
    encrypt(today.setDate(today.getDate() + invitationLifetimeDays).toString())
  }`
}

export const useGuildInvitation = () => {
  const route = useRoute()
  const { player } = useCurrentPlayer()
  const { get: getGuild } = useGuild()
  const { getBooleanInput } = useInput()
  const { alert } = useAlert()

  const storeLink = () => {
    if (route.name !== 'guild-invitation') return

    const token = route.params['token'] as string
    const guildId = route.params['guildId'] as string

    setInStorage<Invitation>(
      sessionStorageKeys.guildInvitation,
      { guildId, token },
      'session'
    )
  }

  const consumeLink = async () => {
    if (!player.value) return

    const invitation = getFromStorage<Invitation>(
      sessionStorageKeys.guildInvitation,
      'session'
    )

    if (!invitation) return

    eraseInStorage(sessionStorageKeys.guildInvitation, 'session')

    const { guildId, token } = invitation

    // Valida o token
    const tokenValidty = new Date(token)

    // Pega as informacoes
    const guild = await getGuild(guildId)

    if (!isValidDate(tokenValidty) || !guild) {
      alert('error', 'Convite de guilda inválido')
      return
    }

    if (new Date() > tokenValidty) {
      alert('error', 'Convite expirado')
      return
    }

    // Verificar se jogador aceita entrar
    try {
      const decision = await getBooleanInput({
        cancellable: true,
        messageHtml: `Deseja aceitar o convite para a guilda <b>${guild.name}</b>?`,
        trueButton: { buttonProps: { variant: 'colored' } },
      })

      if (!decision) return
    } catch {
      return
    }

    if (player.value) addRelation(vase, guild, 'players', [player.value])
  }

  return { storeLink, consumeLink }
}
