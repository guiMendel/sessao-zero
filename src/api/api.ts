import { fillFirevase } from '@/firevase'
import { firebaseApp } from './firebase'
import { Guild } from './guilds'
import { Notification } from './notifications'
import { Player } from './players'

/** Cliente firevase do sessao zero */
export const vase = fillFirevase<{
  guilds: Guild
  players: Player
  notifications: Notification
}>(firebaseApp, ['guilds', 'players', 'notifications'])
  .configureManyToMany({
    /** As guildas das quais os jogadores sao membros */
    playersGuilds: ['guilds', 'players'],

    /** As guildas para as quais os jogadores solicitaram admissao */
    admissionRequests: ['guilds', 'players'],
  })
  .configureRelations(({ hasMany, hasOne }) => ({
    guilds: {
      owner: hasOne('players', { relationKey: 'ownerUid' }, 'protected'),
      players: hasMany('players', { manyToManyTable: 'playersGuilds' }),
      admissionRequests: hasMany('players', {
        manyToManyTable: 'admissionRequests',
      }),
    },

    players: {
      ownedGuilds: hasMany('guilds', { relationKey: 'ownerUid' }),
      guilds: hasMany('guilds', { manyToManyTable: 'playersGuilds' }),
      admissionRequests: hasMany('guilds', {
        manyToManyTable: 'admissionRequests',
      }),
      notifications: hasMany('notifications', { relationKey: 'playerId' }),
    },
  }))

/** Tipo do cliente firevase do sessao zero */
export type Vase = typeof vase
