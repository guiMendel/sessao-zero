<script setup lang="ts">
import { useCurrentGuild } from '@/api/guilds'
import {
  Divisor,
  LoadingSpinner,
  PlayerPreview,
  Typography,
} from '@/components'
import { toValue } from 'vue'

const { guild } = useCurrentGuild()
</script>

<template>
  <LoadingSpinner v-if="!guild" />

  <div class="guild-members" v-else>
    <Typography variant="subtitle">Membros</Typography>

    <Typography class="sub-heading">{{ guild.name }}</Typography>

    <div class="members">
      <!-- Perfil do mestre -->
      <PlayerPreview
        :player="toValue(guild.owner)"
        background="main"
        profile-icon="crown"
        :show-profile-button="false"
      />

      <Typography class="label" variant="paragraph-secondary"
        >mestre desta guilda</Typography
      >

      <!-- Demais perfis -->
      <template v-if="toValue(guild.players).length > 0">
        <Divisor class="divisor" />

        <PlayerPreview
          v-for="member in toValue(guild.players)"
          :player="member"
          :key="member.id"
          background="main"
          :show-profile-button="false"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guild-members {
  margin-top: 1rem;
  flex-direction: column;
  gap: 1rem;

  width: 100%;
  text-align: left;

  .sub-heading {
    margin-top: -0.8rem;
    color: var(--tx-trans-45);
  }

  .members {
    margin-top: 1rem;
    gap: 1.5rem;
    flex-direction: column;
    align-items: stretch;

    .label {
      margin-top: -1rem;
      font-weight: 500;
      color: var(--tx-trans-3);
      text-align: center;
      align-self: center;
    }

    .divisor {
      color: var(--main-light);
    }
  }
}
</style>
