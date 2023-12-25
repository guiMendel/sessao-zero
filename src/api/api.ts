import { fillFirevase } from '@/firevase'
import { firebaseApp } from './firebase'
import { Guild } from './guilds'
import { Player } from './players'

/** Cliente firevase do sessao zero */
export const vase = fillFirevase<{ guilds: Guild; players: Player }>(
  firebaseApp,
  ['guilds', 'players']
)
  .configureManyToMany({ playersGuilds: ['guilds', 'players'] })
  .configureRelations(({ hasMany, hasOne }) => ({
    guilds: {
      owner: hasOne('players', { relationKey: 'ownerUid' }, 'protected'),
      players: hasMany('players', { manyToManyTable: 'playersGuilds' }),
    },

    players: {
      ownedGuilds: hasMany('guilds', { relationKey: 'ownerUid' }),
      guilds: hasMany('guilds', { manyToManyTable: 'playersGuilds' }),
    },
  }))

/** Tipo do cliente firevase do sessao zero */
export type Vase = typeof vase
