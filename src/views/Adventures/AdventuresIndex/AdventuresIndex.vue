<script setup lang="ts">
import { isNarrator } from '@/api/adventures'
import { isMember, useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { Button, LoadingSpinner, Typography } from '@/components'
import { localStorageKeys } from '@/utils/config'
import { useLocalStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { useRouter } from 'vue-router'
import monkImage from '../../../assets/consfused-monk.png'
import cricketImage from '../../../assets/cricket.png'
import { AdventurePreview } from './AdventurePreview'
import { Tabs } from '@/components/Tabs'

const { guild } = useCurrentGuild()

const { player } = useCurrentPlayer()

const isPlayerMember = computed(() => isMember(player.value, guild.value))

const router = useRouter()

const createNewAdventure = () => router.push({ name: 'create-adventure' })

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
  <LoadingSpinner v-if="!guild" />

  <div v-else class="adventures-index" :key="guild.id">
    <Tabs :tabs="['play', 'narrate']" v-model="activeViewMode">
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
        <div class="column">
          <template v-if="narratingAdventures.length === 0">
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
              v-for="adventure in narratingAdventures"
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

      <template #play>
        <div class="column">
          <template v-if="othersAdventures.length === 0">
            <Typography variant="paragraph" class="no-adventures-text"
              >(vazio)</Typography
            >

            <img
              :src="cricketImage"
              alt="papel em branco"
              class="cricket-image"
            />

            <!-- Prompt de virar narrador -->
            <Button
              v-if="isPlayerMember"
              @click="
                () =>
                  narratingAdventures.length > 0
                    ? (activeViewMode = 'narrate')
                    : createNewAdventure()
              "
              variant="colored"
            >
              <font-awesome-icon :icon="['fas', 'book-open']" />
              {{
                narratingAdventures.length > 0 ? 'narrar' : 'torne-se narrador'
              }}</Button
            >
          </template>

          <!-- Aventuras da guilda -->
          <AdventurePreview
            v-for="adventure in othersAdventures"
            :adventure-id="adventure.id"
          />
        </div>
      </template>
    </Tabs>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

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

  .column {
    top: 0;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding-top: 1rem;
  }

  .no-adventures-text {
    align-self: center;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .monk-image {
    width: 80%;
    align-self: center;
  }

  .cricket-image {
    width: 60%;
    align-self: center;
  }

  .create-adventure {
    color: var(--tx-main);
    gap: 0.3rem;
    align-items: center;
    align-self: flex-end;
    margin-top: 0.5rem;

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
