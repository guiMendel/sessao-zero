import { defineStore } from '@/stores/defineStore'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { Adventure } from '.'
import { useAdventure } from './useAdventure'

export const useCurrentAdventure = defineStore('current-adventure', () => {
  const { sync, get, deleteForever, update } = useAdventure()
  const route = useRoute()

  const adventure = sync(route?.params.adventureId as string)

  watch(route, ({ params }) => {
    if (params.adventureId != undefined)
      sync(params.adventureId as string, { existingRef: adventure })
  })

  return {
    adventure,

    update: (properties: Partial<Adventure>) =>
      adventure.value
        ? update(adventure.value.id, properties)
        : Promise.reject('No adventure'),

    deleteForever: () =>
      adventure.value
        ? deleteForever(adventure.value.id)
        : Promise.reject('No adventure'),

    getAdventure: async () =>
      route?.params.adventureId != undefined
        ? get(route.params.adventureId as string)
        : undefined,
  }
})
