import { Guild } from '../guilds'
import { Player } from '../players'

export type NotificationType = {
  /** HTML of content body */
  makeBody: (args: any) => string
}

export const notificationTypes = {
  admissionRequest: {
    makeBody: ({ guild, player }: { player: Player; guild: Guild }) =>
      `<b>${guild.name}</b>: ${player.name} solicitou admissão`,
  },

  playerAcceptedInvitation: {
    makeBody: ({ guild, player }: { player: Player; guild: Guild }) =>
      `<b>${guild.name}</b>: ${player.name} entrou na guilda por convite`,
  },

  admissionRequestAccepted: {
    makeBody: ({ guild, player }: { player: Player; guild: Guild }) =>
      `O mestre aceitou sua solicitação: você agora faz parte da guilda <b>${guild.name}</b>!`,
  },
} satisfies Record<string, NotificationType>

export type NotificationTypes = typeof notificationTypes
