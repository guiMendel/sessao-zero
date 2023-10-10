import { useGuild } from '@/api'
import { defineStore } from 'pinia'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export const useCurrentGuild = defineStore('current-guild', () => {
  const { sync, get } = useGuild()
  const route = useRoute()

  const guild = sync(route?.params.guildId as string)

  watch(route, ({ params }) => {
    if (params.guildId != undefined) sync(params.guildId as string, guild)
  })

  return {
    guild,
    getGuild: async () =>
      route?.params.guildId != undefined
        ? get(route.params.guildId as string)
        : undefined,
  }
})
