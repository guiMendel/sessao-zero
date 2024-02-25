<script setup lang="ts">
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import genericBanner from '@/assets/green-table.png'
import { Button, Image, LoadingSpinner, Typography } from '@/components'
import { Tabs } from '@/components/Tabs'
import { hasLoaded } from '@/firevase/resources'
import { sessionStorageKeys } from '@/utils/config'
import { useSessionStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'
import { AdventureDetails } from './AdventureDetails'
import { AdventureMembers } from './AdventureMembers'

const { adventure, addPlayer } = useCurrentAdventure()
const { player } = useCurrentPlayer()
const { guild } = useCurrentGuild()

type Tab = 'detalhes' | 'jogadores'
const allTabs: Tab[] = ['detalhes', 'jogadores']

const route = useRoute()

const tab = useSessionStorage<Tab>(
  `${sessionStorageKeys.adventurePageTab}-${route.params.adventureId}`,
  'detalhes'
)

const guildDisallowsSubscription = computed(
  () => !guild.value?.allowAdventureSubscription
)

// =================================================================
// JOGADOR
// =================================================================

const playerHasRequestedAdmission = computed(() =>
  toValue(player.value?.adventureAdmissionRequests)?.some(
    (requestedAdventure) =>
      adventure.value && requestedAdventure.id === adventure.value.id
  )
)

const showEnter = computed(() =>
  Boolean(
    !playerHasRequestedAdmission.value &&
      player.value &&
      adventure.value?.open &&
      isMember(player.value, guild.value) &&
      !isMember(player.value, adventure.value) &&
      (adventure.value.playerLimit < 0 ||
        adventure.value.playerLimit > toValue(adventure.value.players).length)
  )
)

/** Se esta mostrando a tela de "parece vazio aqui..." com um prompt para entrar */
const showEmptyRoomPrompt = computed(() =>
  Boolean(
    tab.value === 'jogadores' &&
      adventure.value?.open &&
      !guildDisallowsSubscription &&
      toValue(adventure.value.players)?.length === 0
  )
)

const enter = () => player.value && addPlayer(player.value)

const joinLabel = adventure.value?.requireAdmission
  ? 'solicitar entrada'
  : 'entrar'
</script>

<template>
  <LoadingSpinner class="loading" v-if="!adventure || !player" />

  <div
    v-else
    class="adventure"
    :class="{ 'extra-bottom-padding': showEnter && !showEmptyRoomPrompt }"
  >
    <Image
      :src="toValue(adventure.banner)"
      :backup-src="genericBanner"
      :has-loaded="hasLoaded([adventure, 'banner'])"
      class="banner"
    />

    <div class="content">
      <Typography class="subheader">aventura</Typography>

      <Typography variant="title" class="title">{{
        adventure.name
      }}</Typography>

      <!-- Entrar na guilda -->
      <Button
        v-if="showEnter && !showEmptyRoomPrompt"
        variant="colored"
        class="enter-guild-button"
        @click="enter"
        ><font-awesome-icon :icon="['fas', 'dungeon']" />{{ joinLabel }}</Button
      >

      <Tabs :tabs="allTabs" v-model="tab">
        <template #jogadores:option>
          <div class="tab" :class="{ active: tab === 'jogadores' }">
            <Typography>jogadores</Typography>

            <div class="count">
              <Typography class="text">{{
                toValue(adventure.players).length
              }}</Typography>
              <Typography v-if="adventure.playerLimit > 0" class="text limit"
                >/{{ adventure.playerLimit }}</Typography
              >
            </div>
          </div>
        </template>

        <template #detalhes><AdventureDetails /></template>

        <template #jogadores
          ><AdventureMembers
            :join-label="joinLabel"
            :show-empty-room-prompt="showEmptyRoomPrompt"
            :show-enter="showEnter"
            :guild-disallows-subscription="guildDisallowsSubscription"
        /></template>
      </Tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.loading {
  align-self: center;
}

.adventure {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  &.extra-bottom-padding {
    padding-bottom: 4rem;
  }

  .banner {
    max-width: 50rem;
  }

  .divisor {
    color: var(--tx-main-light);
    margin-block: 0.8rem;
  }

  .content {
    padding-inline: 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .title {
    color: var(--tx-main);
    margin-bottom: 1rem;
    text-align: left;
  }

  .subheader {
    color: var(--tx-trans-3);
    font-weight: 500;
    margin-block: -0.2rem;
  }

  .tab {
    color: var(--tx-trans-45);
    transition: all 200ms;
    align-items: center;
    gap: 0.3rem;

    .count {
      height: 1.2rem;
      background-color: var(--bg-trans-2);
      color: var(--tx-trans-3);
      align-items: center;
      justify-content: center;
      font-weight: 800;
      border-radius: 12px;
      transition: 200ms all;
      padding-inline: 0.4rem;

      .text {
        font-size: 0.8rem;

        &.limit {
          font-size: 0.6rem;
        }
      }
    }

    &.active {
      color: var(--tx-main);

      .count {
        background-color: var(--main-light);
        color: var(--tx-main-dark);
      }
    }
  }

  .stop-knight {
    width: 70%;
    align-self: center;
  }
}
</style>

<style lang="scss">
.adventure .content .enter-guild-button {
  position: fixed;
  right: 0.6rem;
  bottom: 1rem;
  z-index: 100;

  button {
    min-width: unset;
  }
}
</style>
