import { useGuild } from '@/api'
import { Guild } from '@/utils'
import { defineStore } from 'pinia'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export const useCurrentGuild = defineStore('current-guild', () => {
  const { sync, get, deleteForever, update } = useGuild()
  const route = useRoute()

  const guild = sync(route?.params.guildId as string)

  watch(route, ({ params }) => {
    if (params.guildId != undefined) sync(params.guildId as string, guild)
  })

  return {
    guild,

    update: (properties: Partial<Guild>) =>
      guild.value
        ? update(guild.value.id, properties)
        : Promise.reject('No guild'),

    deleteForever: () =>
      guild.value ? deleteForever(guild.value.id) : Promise.reject('No guild'),

    getGuild: async () =>
      route?.params.guildId != undefined
        ? get(route.params.guildId as string)
        : undefined,
  }
})
