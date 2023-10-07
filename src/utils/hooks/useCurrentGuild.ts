import { useGuildAPI } from '@/api'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export const useCurrentGuild = () => {
  const { sync, get } = useGuildAPI()
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
}
