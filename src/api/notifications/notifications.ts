import { Adventure } from '../adventures'
import { Guild } from '../guilds'
import { Player } from '../players'

export type NotificationType = {
  /** HTML of content body */
  makeBody: (args: any) => string
}

export const notificationTypes = {
  // Guilds
  guildAdmissionRequest: {
    makeBody: ({ guild, player }: { player: Player; guild: Guild }) =>
      `<b>${guild.name}</b>: ${player.name} solicitou admissão`,
  },

  playerAcceptedGuildInvitation: {
    makeBody: ({ guild, player }: { player: Player; guild: Guild }) =>
      `<b>${guild.name}</b>: ${player.name} entrou na guilda por convite`,
  },

  guildAdmissionRequestAccepted: {
    makeBody: ({ guild }: { guild: Guild }) =>
      `O mestre aceitou sua solicitação: você agora faz parte da guilda <b>${guild.name}</b>!`,
  },

  // Adventures
  playerJoinedAdventure: {
    makeBody: ({
      adventure,
      player,
    }: {
      player: Player
      adventure: Adventure
    }) =>
      `<b>${player.nickname}</b> entrou na sua aventura <b>${adventure.name}</b>!`,
  },

  playerLeftAdventure: {
    makeBody: ({
      adventure,
      player,
    }: {
      player: Player
      adventure: Adventure
    }) =>
      `Adeus! <b>${player.nickname}</b> deixou sua aventura <b>${adventure.name}</b>`,
  },
} satisfies Record<string, NotificationType>

export type NotificationTypes = typeof notificationTypes
