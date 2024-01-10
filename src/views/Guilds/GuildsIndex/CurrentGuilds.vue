<script lang="ts" setup>
import { useGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { Button, Typography } from '@/components'
import { hasLoaded } from '@/firevase/resources'
import { unwrapStore } from '@/utils/functions'
import { computed, toValue, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { GuildList } from './GuildList'

const { syncList } = useGuild()

const { player } = unwrapStore(useCurrentPlayer())

const guilds = syncList()

const joinedGuilds = computed(() =>
  player.value == undefined
    ? []
    : guilds.value.filter((guild) =>
        toValue(guild.players).some((member) => member.id === player.value!.id)
      )
)

const router = useRouter()

const addNewGuild = () => {
  router.push({
    name: 'add-guild',
  })
}

// Se nao tiver nenhuma guilda, vai direto pra pagina de adicionar guildas
watchEffect(() => {
  // Deve ter carregado todos os recursos
  if (!hasLoaded(player, [guilds, 'players']) || player.value == undefined)
    return

  // Verifica se faz parte de alguma guilda
  if (
    guilds.value.filter((guild) =>
      toValue(guild.players).some((member) => member.id === player.value!.id)
    ).length == 0
  )
    addNewGuild()
})
</script>

<template>
  <div v-if="player" class="guilds-index">
    <!-- Guildas que eh dono -->
    <template v-if="toValue(player.ownedGuilds).length > 0">
      <!-- <Typography variant="subtitle">Mestre</Typography> -->

      <GuildList :guilds="toValue(player.ownedGuilds)" />
    </template>

    <!-- Guildas que ja faz parte -->
    <template v-if="joinedGuilds.length > 0">
      <Typography variant="subtitle">Suas guildas</Typography>

      <GuildList :guilds="joinedGuilds" />
    </template>

    <Button variant="light" class="enter-new-guild-button" @click="addNewGuild"
      ><font-awesome-icon :icon="['fas', 'plus']" /> adicionar guilda</Button
    >
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

  .ask-for-invite-hint {
    text-align: center;
    margin-top: 2rem;
    color: var(--tx-trans-3);
    font-size: 0.9rem;
  }

  .enter-new-guild-button {
    margin-top: 1rem;
  }
}
</style>
