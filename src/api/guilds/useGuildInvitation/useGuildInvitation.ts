import { useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import { useAlert } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, getFromStorage, setInStorage } from '@/utils/functions'
import { decrypt, encrypt } from '@/utils/functions/encryption'
import { toValue } from 'vue'
import { useRouter } from 'vue-router'
import { isMember, useGuild, useJoinGuild } from '..'

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
  const expiration = new Date()

  expiration.setDate(expiration.getDate() + invitationLifetimeDays)

  return `${fullPath ? window.location.origin : ''}/${guildId}/${
    overrideToken ?? encrypt(expiration.toString())
  }`
}

export const useGuildInvitation = () => {
  const router = useRouter()
  const { player } = useCurrentPlayer()
  const { get: getGuild } = useGuild()
  const { alert } = useAlert()
  const { notifyPlayer } = useNotification()
  const joinGuild = useJoinGuild()

  const storeLink = () => {
    const route = router.currentRoute.value

    if (route.name !== 'guild-invitation') return

    const token = route.params['token'] as string
    const guildId = route.params['guildId'] as string

    setInStorage<Invitation>(
      sessionStorageKeys.guildInvitation,
      { guildId, token },
      'session'
    )
  }

  /** Retorna verdadeiro caso tenha cosneguido entrar na guilda */
  const consumeLink = async (): Promise<boolean> => {
    if (!player.value) return false

    const invitation = getFromStorage<Invitation>(
      sessionStorageKeys.guildInvitation,
      'session'
    )

    if (!invitation) return false

    eraseInStorage(sessionStorageKeys.guildInvitation, 'session')

    const { guildId, token } = invitation

    // Valida o token
    const tokenValidty = new Date(decrypt(token))

    // Pega as informacoes
    const guild = await getGuild(guildId)

    if (!isValidDate(tokenValidty) || !guild) {
      alert('error', 'Convite de guilda inválido')
      return false
    }

    if (new Date() > tokenValidty) {
      alert('error', 'Convite expirado')
      return false
    }

    // Ignora se o jogador ja esta na guilda
    if (isMember(player.value, guild)) {
      router.push({ name: 'adventures', params: { guildId: guild.id } })

      alert('success', 'Já é membro desta guilda')

      return false
    }

    router.push({ name: 'adventures', params: { guildId: guild.id } })

    const admissionRequested = toValue(player.value?.admissionRequests)?.some(
      (requestedGuild) => requestedGuild.id === guild.id
    )

    try {
      const joined = await joinGuild(player.value, guild, admissionRequested)

      if (!joined) return false
    } catch (error) {
      alert('error', error as string)
    }

    notifyPlayer(guild.ownerUid, {
      type: 'playerAcceptedInvitation',
      params: { guild, player: player.value },
    })

    return true
  }

  return { storeLink, consumeLink }
}
