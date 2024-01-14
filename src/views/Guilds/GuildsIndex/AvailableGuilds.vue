<script lang="ts" setup>
import { isMember, useGuild } from '@/api/guilds'
import { isGuildMaster, useCurrentPlayer } from '@/api/players'
import { BackButton, Divisor, Typography } from '@/components'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import sadDragonIllustration from '../../../assets/crying-drake.png'
import { GuildList } from './GuildList'

const { syncList } = useGuild()

const { player } = storeToRefs(useCurrentPlayer())

const allGuilds = syncList()

const guilds = computed(() => {
  const unjoined = allGuilds.value.filter(
    (guild) => !isMember(player.value, guild)
  )

  const available: typeof unjoined = [],
    unavailable: typeof unjoined = []

  for (const guild of unjoined) {
    if (guild.open) available.push(guild)
    else unavailable.push(guild)
  }

  return {
    unjoined,
    available,
    unavailable,
  }
})

const showBackButton = computed(() => {
  if (player.value == undefined || isGuildMaster(player.value)) return true

  const currentGuilds = allGuilds.value.filter((guild) =>
    isMember(player.value, guild)
  )

  // Nao mostra o botao se nao tiver nenhuma guilda atualmente E nao for admin
  return currentGuilds.length != 0
})
</script>

<template>
  <div v-if="player" class="guilds-index">
    <BackButton v-if="showBackButton" />

    <!-- Guildas disponiveis para entrar -->
    <template v-if="guilds.unjoined.length > 0">
      <Typography variant="subtitle">Guildas disponíveis</Typography>

      <GuildList
        v-if="guilds.available.length > 0"
        hide-new-button
        :guilds="guilds.available"
      />

      <Divisor
        v-if="guilds.available.length > 0 && guilds.unavailable.length > 0"
        class="divisor"
      />

      <GuildList
        v-if="guilds.unavailable.length > 0"
        hide-new-button
        :guilds="guilds.unavailable"
      />

      <Typography class="ask-for-invite-hint"
        >Não encontrou o que estava procurando? Peça um convite ao mestre da
        guilda!</Typography
      >
    </template>

    <!-- Se nao tem nenhuma guilda e nao pode criar guilda -->
    <template v-else>
      <div class="no-guilds">
        <Typography class="title" variant="subtitle"
          >Sem guildas públicas</Typography
        >

        <Typography>Solicite um convite a um mestre de guilda!</Typography>

        <div class="sad-dragon">
          <img :src="sadDragonIllustration" />
        </div>
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
  margin-top: 1rem;
  padding: 0 1.5rem 2rem;

  .no-guilds {
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: justify;
    margin-top: 1rem;

    .title {
      align-self: flex-start;
    }

    .sad-dragon {
      flex: 1;
      flex-direction: column;
      justify-content: center;

      img {
        width: 9rem;
      }
    }
  }

  .divisor {
    color: var(--tx-gray);
    margin-block: 0.5rem;
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
