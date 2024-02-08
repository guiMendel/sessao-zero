import { fillFirevase } from '@/firevase'
import { firebaseApp } from './firebase'
import { Guild } from './guilds'
import { Notification } from './notifications'
import { Player } from './players'
import { Adventure } from './adventures'

/** Cliente firevase do sessao zero */
export const vase = fillFirevase<{
  guilds: Guild
  players: Player
  notifications: Notification
  adventures: Adventure
}>(firebaseApp, ['guilds', 'players', 'notifications', 'adventures'])
  .configureManyToMany({
    /** As guildas das quais os jogadores sao membros */
    playersGuilds: ['guilds', 'players'],

    /** As guildas para as quais os jogadores solicitaram admissao */
    guildAdmissionRequests: ['guilds', 'players'],

    /** As aventuras das quais os jogadores sao membros */
    playersAdventures: ['adventures', 'players'],

    /** Relaciona aventuras com seus narradores */
    narratorsAdventures: ['adventures', 'players'],

    /** As aventuras para as quais os jogadores solicitaram admissao */
    adventureAdmissionRequests: ['adventures', 'players'],
  })
  .configureRelations(({ hasMany, hasOne }) => ({
    guilds: {
      // Adventures
      adventures: hasMany('adventures', { relationKey: 'guildId' }),

      // Players
      owner: hasOne('players', { relationKey: 'ownerUid' }, 'protected'),

      players: hasMany('players', { manyToManyTable: 'playersGuilds' }),

      admissionRequests: hasMany('players', {
        manyToManyTable: 'guildAdmissionRequests',
      }),
    },

    players: {
      notifications: hasMany('notifications', { relationKey: 'playerId' }),

      // Guilds
      ownedGuilds: hasMany('guilds', { relationKey: 'ownerUid' }),

      guilds: hasMany('guilds', { manyToManyTable: 'playersGuilds' }),

      guildAdmissionRequests: hasMany('guilds', {
        manyToManyTable: 'guildAdmissionRequests',
      }),

      // Adventures
      narratorAdventures: hasMany('adventures', {
        manyToManyTable: 'narratorsAdventures',
      }),

      playerAdventures: hasMany('adventures', {
        manyToManyTable: 'playersAdventures',
      }),

      adventureAdmissionRequests: hasMany('adventures', {
        manyToManyTable: 'adventureAdmissionRequests',
      }),
    },

    adventures: {
      guild: hasOne('guilds', { relationKey: 'guildId' }, 'protected'),

      players: hasMany('players', { manyToManyTable: 'playersAdventures' }),

      narrators: hasMany('players', { manyToManyTable: 'narratorsAdventures' }),

      admissionRequests: hasMany('players', {
        manyToManyTable: 'adventureAdmissionRequests',
      }),
    },
  }))

/** Tipo do cliente firevase do sessao zero */
export type Vase = typeof vase
