<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import monkImage from '@/assets/consfused-monk.png'
import { Button, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AdventurePreview } from '../AdventurePreview'

defineProps<{ adventures: Resource<Vase, 'adventures'>[] }>()

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

const isPlayerMember = computed(() => isMember(player.value, guild.value))

const router = useRouter()

const createNewAdventure = () => router.push({ name: 'create-adventure' })
</script>

<template>
  <div class="narrating-adventures">
    <template v-if="adventures.length === 0">
      <Typography variant="paragraph" class="no-adventures-text"
        >Você ainda não narra nenhuma aventura por aqui!</Typography
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
        v-for="adventure in adventures"
        :adventure-id="adventure.id"
      />

      <Typography
        v-if="isPlayerMember"
        @click="createNewAdventure"
        class="create-adventure"
      >
        criar nova
        <font-awesome-icon :icon="['fas', 'pen-ruler']" />
      </Typography>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.narrating-adventures {
  top: 0;
  left: 0;
  right: 0;
  flex-direction: column;
  align-items: stretch;
  gap: 2rem;
  padding-top: 2rem;

  .no-adventures-text {
    align-self: center;
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
    margin-top: -0.5rem;

    background-color: var(--bg-main-lighter);
    padding: 0.5rem 1rem;
    border-radius: $border-radius;

    font-weight: 500;
    @include high-contrast-border;

    svg {
      font-size: 0.9rem;
    }
  }
}
</style>
