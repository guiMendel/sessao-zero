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
} satisfies Record<string, NotificationType>

export type NotificationTypes = typeof notificationTypes
