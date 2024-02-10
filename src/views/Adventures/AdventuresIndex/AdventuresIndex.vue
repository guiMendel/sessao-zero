<script setup lang="ts">
import { isMember, useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { Button, LoadingSpinner, Typography } from '@/components'
import { computed, toValue } from 'vue'
import monkImage from '../../../assets/consfused-monk.png'
import { AdventurePreview } from './AdventurePreview'
import { useRouter } from 'vue-router'

const { guild } = useCurrentGuild()

const { player } = useCurrentPlayer()

const isPlayerMember = computed(() => isMember(player.value, guild.value))

const router = useRouter()

const createNewAdventure = () => router.push({ name: 'create-adventure' })
</script>

<template>
  <LoadingSpinner v-if="!guild" />

  <div v-else class="adventures-index">
    <template v-if="toValue(guild.adventures).length === 0">
      <Typography variant="paragraph" class="no-adventures-text"
        >Não conseguimos encontrar nenhuma aventura aqui!</Typography
      >

      <img :src="monkImage" alt="papel em branco" class="monk-image" />

      <Button
        v-if="isPlayerMember"
        @click="createNewAdventure"
        variant="colored"
      >
        <font-awesome-icon :icon="['fas', 'pen-ruler']" /> criar primeira
        aventura!</Button
      >
    </template>

    <template v-else>
      <!-- Aventuras da guilda -->
      <AdventurePreview
        v-for="adventure in toValue(guild.adventures)"
        :adventure="adventure"
      />

      <Typography
        v-if="isPlayerMember"
        @click="createNewAdventure"
        class="create-adventure"
      >
        criar
        <font-awesome-icon :icon="['fas', 'pen-ruler']" />
      </Typography>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.adventures-index {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  padding-top: 1rem;

  .no-adventures-text {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .monk-image {
    width: 80%;
    align-self: center;
  }

  .create-adventure {
    color: var(--tx-main);
    gap: 0.3rem;
    align-items: center;
    align-self: flex-end;

    background-color: var(--bg-main-lighter);
    padding: 0.5rem 1rem;
    border-radius: $border-radius;

    font-weight: 500;

    svg {
      font-size: 0.9rem;
    }
  }
}
</style>
