<script lang="ts" setup>
import { useGuild } from '@/api/resourcePaths/guilds'
import { useCurrentPlayer } from '@/api/resourcePaths/players'
import { Typography } from '@/components'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import sadDragonIllustration from '../../../assets/sad-dragon.png'
import { GuildList } from './GuildList'

const { syncList } = useGuild()

const { player } = storeToRefs(useCurrentPlayer())

const guilds = syncList()

const otherAvailableGuilds = computed(() =>
  guilds.value.filter(({ id }) =>
    player.value?.ownedGuilds.every((ownedGuild) => ownedGuild.id != id)
  )
)
</script>

<template>
  <div class="guilds-index">
    <!-- Guildas que ja faz parte -->
    <template v-if="player?.ownedGuilds.length > 0">
      <Typography variant="subtitle">Suas guildas</Typography>

      <GuildList :guilds="player.ownedGuilds" />
    </template>

    <!-- Guildas disponiveis para entrar -->
    <template v-if="otherAvailableGuilds.length > 0">
      <Typography variant="subtitle">Guildas disponíveis</Typography>

      <GuildList hide-new-button :guilds="otherAvailableGuilds" />
    </template>

    <!-- Se nao tem nenhuma guilda e nao pode criar guilda -->
    <template v-else-if="!player?.admin">
      <div class="no-guilds">
        <Typography class="title" variant="subtitle">Sem guildas</Typography>

        <Typography
          >Oh não, você não tem acesso a nenhuma guilda! Solicite um convite a
          um mestre de guilda!</Typography
        >

        <img class="sad-dragon" :src="sadDragonIllustration" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guilds-index {
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  max-width: 100%;
  padding: 0 1.5rem 2rem;

  .no-guilds {
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: justify;

    .title {
      align-self: flex-start;
    }

    .sad-dragon {
      width: 9rem;
    }
  }
}
</style>
@/utils/types
@/api/guilds@/api/players