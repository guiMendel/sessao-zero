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

  <div v-else class="adventures-index">
    <div
      class="view-mode-tabs"
      @click="
        activeViewMode = activeViewMode === 'narrate' ? 'play' : 'narrate'
      "
      :class="`mode-${activeViewMode}`"
    >
      <div class="tab play">
        <Typography>jogar</Typography>
        <Typography class="count">{{ othersAdventures.length }}</Typography>
      </div>

      <div class="tab narrate">
        <Typography>narrar</Typography>
        <Typography class="count">{{ narratingAdventures.length }}</Typography>
      </div>

      <div class="selection-border"></div>
    </div>

    <div class="adventures">
      <Transition name="play-transition">
        <div class="column" v-if="activeViewMode === 'play'">
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
      </Transition>

      <Transition name="narrate-transition">
        <div class="column" v-if="activeViewMode === 'narrate'">
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
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.adventures-index {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  padding-top: 1rem;

  .view-mode-tabs {
    align-items: stretch;
    border-bottom: 3px solid var(--tx-trans-1);
    position: relative;

    &.mode-narrate {
      .selection-border {
        left: 50%;
      }

      .narrate {
        color: var(--tx-main);

        .count {
          background-color: var(--main-light);
          color: var(--tx-main-dark);
        }
      }
    }

    &.mode-play .play {
      color: var(--tx-main);

      .count {
        background-color: var(--main-light);
        color: var(--tx-main-dark);
      }
    }

    .selection-border {
      width: 50%;
      top: 0;
      left: 0;
      bottom: -3px;
      position: absolute;
      background-color: var(--bg-main-lighter);
      border-radius: 6px 6px 0 0;
      border-bottom: 3px solid var(--tx-main);
      transition: all 200ms ease-out;
    }

    .tab {
      z-index: 10;
      flex: 1;
      padding-block: 0.5rem;
      color: var(--tx-trans-45);
      transition: all 200ms;
      font-weight: 500;
      text-align: center;
      justify-content: center;
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
    }
  }

  .adventures {
    flex-direction: column;
    align-items: stretch;
    position: relative;

    .play-transition-enter-active {
      position: absolute;
      animation: slide-left 200ms ease-out reverse;
    }

    .play-transition-leave-active {
      animation: slide-left 200ms ease-out;
    }

    @keyframes slide-left {
      from {
        opacity: 1;
        translate: 0 0;
      }

      to {
        opacity: 0;
        translate: -60% 0;
      }
    }

    .narrate-transition-enter-active {
      position: absolute;
      animation: slide-right 200ms ease-out reverse;
    }

    .narrate-transition-leave-active {
      animation: slide-right 200ms ease-out;
    }

    @keyframes slide-right {
      from {
        opacity: 1;
        translate: 0 0;
      }

      to {
        opacity: 0;
        translate: 60% 0;
      }
    }

    .column {
      top: 0;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
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

    svg {
      font-size: 0.9rem;
    }
  }
}
</style>
