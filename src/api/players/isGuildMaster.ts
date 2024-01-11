import { Player } from '.'

/** Retorna se o jogador tem poder de criar e possuir guildas */
export const isGuildMaster = (player: Player) =>
  Boolean(player.accessLevel && player.accessLevel >= 1)
