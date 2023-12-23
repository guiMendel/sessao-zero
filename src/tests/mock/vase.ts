import { fillFirevase } from '@/firevase'
import { mockFirebaseApp, setUpFirebaseMocks } from './firebase'

type Knight = {
  name: string
  gold: number

  kingId: string
}

type King = {
  name: string
  age: number
  hasSuccessor: boolean
}

type Land = {
  name: string
  biome: 'desert' | 'woods' | 'plains' | 'hills' | 'swamp' | 'tundra'

  kingId: string
}

type Mission = {
  priority: 'urgent' | 'high' | 'medium'
}

/** Client firevase de teste */
export const mockVase = fillFirevase<{
  knights: Knight
  kings: King
  lands: Land
  missions: Mission
}>(mockFirebaseApp, ['kings', 'knights', 'lands', 'missions'])
  .configureManyToMany({
    knightsLands: ['knights', 'lands'],
    knightsMissions: ['knights', 'missions'],
  })
  .configureRelations(({ hasMany, hasOne }) => ({
    kings: {
      knights: hasMany('knights', { relationKey: 'kingId' }),
      lands: hasMany('lands', { relationKey: 'kingId' }),
    },

    knights: {
      king: hasOne('kings', { relationKey: 'kingId' }, 'required'),
      missions: hasMany('missions', { manyToManyTable: 'knightsMissions' }),
      supervisedLands: hasMany('lands', { manyToManyTable: 'knightsLands' }),
    },

    lands: {
      ruler: hasOne('kings', { relationKey: 'kingId' }),
      supervisors: hasMany('knights', { manyToManyTable: 'knightsLands' }),
    },

    missions: {
      members: hasMany('knights', { manyToManyTable: 'knightsMissions' }),
    },
  }))

/** Tipo do cliente firevase de teste */
export type MockVase = typeof mockVase

export const setupVaseMocks = () => setUpFirebaseMocks()
