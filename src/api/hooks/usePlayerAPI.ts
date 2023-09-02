import { Player } from '@/types/'
import { useResourceAPI } from './useResourceAPI'

export const usePlayerAPI = () => useResourceAPI<Player>('players')
