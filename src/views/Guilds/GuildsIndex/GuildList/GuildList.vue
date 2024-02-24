<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentPlayer } from '@/api/players'
import { LoadingSpinner, Typography } from '@/components'
import { HalfResource, Resource, hasLoaded } from '@/firevase/resources'
import { toValue } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  guilds: Resource<Vase, 'guilds'>[]
  hideNewButton?: boolean
}>()

const { player } = useCurrentPlayer()
const router = useRouter()

const openGuildPage = (guild: HalfResource<Vase, 'guilds'>) =>
  router.push({ name: 'adventures', params: { guildId: guild.id } })

const isOwner = (guild: Resource<Vase, 'guilds'>) =>
  player.value?.id === toValue(guild.owner)?.id
</script>

<template>
  <div class="guild-list">
    <div
      class="guild"
      v-for="guild in guilds"
      :key="guild.id"
      @click="openGuildPage(guild)"
      :class="{
        unavailable: !guild.open,
      }"
    >
      <div class="data">
        <div class="row less-gap">
          <!-- Cadeado -->
          <div v-if="!guild.open" class="icon">
            <font-awesome-icon :icon="['fas', 'lock']" />
          </div>

          <!-- Nome -->
          <Typography class="text">{{ guild.name }}</Typography>
        </div>

        <div class="row">
          <!-- Carregando -->
          <LoadingSpinner v-if="!hasLoaded([guild, 'owner'])" class="spinner" />

          <!-- Dono -->
          <div class="owner" v-else-if="!isOwner(guild)">
            <font-awesome-icon :icon="['fas', 'crown']" />
            <Typography variant="paragraph-secondary">{{
              toValue(guild.owner)?.name
            }}</Typography>
          </div>

          <!-- Indicador de requer admissao -->
          <div class="icon warning" v-if="guild.requireAdmission">
            <font-awesome-icon :icon="['fas', 'envelope']" />
          </div>

          <!-- Numero de membros -->
          <div class="icon">
            {{ toValue(guild.players).length }}
            <font-awesome-icon :icon="['fas', 'user-group']" />
          </div>

          <!-- Numero de aventuras -->
          <div class="icon">
            {{ toValue(guild.adventures).length }}
            <font-awesome-icon :icon="['fas', 'scroll']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guild-list {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  // width: 50rem;
  max-width: 100%;

  --min-height: 4rem;

  .guild {
    align-items: center;
    border-radius: $border-radius;
    padding: 0.5rem 1rem;
    background-color: var(--bg-main-light);
    min-height: var(--min-height);
    cursor: pointer;
    transition: all 200ms;

    &:hover {
      filter: brightness(1.04)
    }

    @include bevel(var(--main));
    @include high-contrast-border;

    &.unavailable {
      background-color: var(--bg-gray-light);
      @include bevel(var(--gray));

      .data .row .owner {
        p,
        svg {
          color: var(--tx-gray);
        }
      }
    }
    

    .data {
      flex: 1;
      flex-direction: column;
      align-items: stretch;
      gap: 0.3rem;

      .row {
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;

        &.less-gap {
          gap: 0.5rem;
        }

        .text {
          color: var(--tx-white);
          font-weight: 600;
          margin-right: auto;
        }

        .spinner {
          margin-right: auto;
        }

        .owner {
          align-items: center;
          margin-right: auto;
          gap: 0.3rem;
          background-color: var(--bg-white);
          padding: 0.2rem 0.5rem;
          border-radius: $border-radius;
          opacity: 0.8;
          @include high-contrast-border;

          p {
            color: var(--tx-main);
            font-weight: 500;
          }

          svg {
            color: var(--tx-main);
            font-size: 0.8rem;
          }
        }

        .icon {
          align-items: center;
          gap: 0.2rem;

          font-size: 0.9rem;
          font-weight: 500;
          color: var(--tx-trans-3);

          &.warning {
            background-color: var(--bg-warning);
            width: 1.7rem;
            height: 1.7rem;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            
            color: var(--tx-warning-darker)
          }
        }
      }
    }
  }

  .add-guild {
    @include button;
    @include bevel(var(--bg-main-washed));

    background-color: var(--bg-main-lighter);
    padding: 0.7rem 1rem;
    align-items: center;
    justify-content: center;
    color: var(--tx-main);
    font-size: 1.4rem;
    min-height: var(--min-height);
  }
}
</style>
