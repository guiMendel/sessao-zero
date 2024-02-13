<script setup lang="ts">
import { isNarrator } from '@/api/adventures'
import { useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { LoadingSpinner, Typography } from '@/components'
import { Tabs } from '@/components/Tabs'
import { localStorageKeys } from '@/utils/config'
import { useLocalStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { NarratingAdventures } from './NarratingAdventures'
import { PlayingAdventures } from './PlayingAdventures'
import { isMember } from '@/api/isMember'
import { hasLoaded } from '@/firevase/resources'

const { guild } = useCurrentGuild()

const { player } = useCurrentPlayer()

const narratingAdventures = computed(() =>
  player.value && guild.value
    ? toValue(guild.value.adventures)?.filter(
        (adventure) => player.value && isNarrator(player.value.id, adventure)
      )
    : []
)

const othersAdventures = computed(() =>
  player.value && guild.value
    ? toValue(guild.value.adventures)?.filter(
        (adventure) => player.value && !isNarrator(player.value.id, adventure)
      )
    : []
)

const activeViewMode = useLocalStorage<'narrate' | 'play'>(
  localStorageKeys.adventureViewMode,
  'play'
)
</script>

<template>
  <LoadingSpinner class="loading-spinner" v-if="!guild" />

  <div v-else class="adventures-index" :key="guild.id">
    <!-- Se nao eh membro da guilda, so visualiza as aventuras que ja existem -->
    <PlayingAdventures
      :adventures="othersAdventures"
      :is-narrator="false"
      v-if="!isMember(player, guild)"
    />

    <Tabs v-else :tabs="['play', 'narrate']" v-model="activeViewMode">
      <template #play:option>
        <div class="tab" :class="{ active: activeViewMode === 'play' }">
          <Typography>jogar</Typography>
          <Typography class="count">{{ othersAdventures.length }}</Typography>
        </div>
      </template>

      <template #narrate:option>
        <div class="tab" :class="{ active: activeViewMode === 'narrate' }">
          <Typography>narrar</Typography>
          <Typography class="count">{{
            narratingAdventures.length
          }}</Typography>
        </div>
      </template>

      <template #narrate>
        <LoadingSpinner
          class="loading-spinner inner"
          v-if="!hasLoaded([guild, 'adventures'])"
        />

        <NarratingAdventures v-else :adventures="narratingAdventures" />
      </template>

      <template #play>
        <LoadingSpinner
          class="loading-spinner inner"
          v-if="!hasLoaded([guild, 'adventures'])"
        />

        <PlayingAdventures
          v-else
          :adventures="othersAdventures"
          :is-narrator="narratingAdventures.length > 0"
          @request-narration="activeViewMode = 'narrate'"
        />
      </template>
    </Tabs>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.loading-spinner {
  font-size: 1.8rem;

  &.inner {
    margin-top: 3rem;
  }
}

.adventures-index {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  padding-inline: 1.5rem;

  .tab {
    color: var(--tx-trans-45);
    transition: all 200ms;
    align-items: center;
    gap: 0.3rem;

    .count {
      width: 1.2rem;
      height: 1.2rem;
      background-color: var(--bg-trans-2);
      color: var(--tx-trans-3);
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      border-radius: 50%;
      transition: 200ms all;
    }

    &.active {
      color: var(--tx-main);

      .count {
        background-color: var(--main-light);
        color: var(--tx-main-dark);
      }
    }
  }
}
</style>
