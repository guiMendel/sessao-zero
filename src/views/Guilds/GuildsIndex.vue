<script lang="ts" setup>
import { FullInstance, useGuild } from '@/api'
import { LoadingSpinner, Typography } from '@/components'
import { useCurrentPlayer } from '@/stores'
import { Guild, Resource } from '@/types'
import { storeToRefs } from 'pinia'
import { toValue } from 'vue'
import { useRouter } from 'vue-router'

const { create, syncList } = useGuild()
const router = useRouter()

const { player } = storeToRefs(useCurrentPlayer())

const newGuild = () => {
  const name = prompt('Nome da guilda')

  if (name == undefined) return

  create(name)
}

const getOwnerLabel = (owner: FullInstance<'players'>) =>
  player.value?.id === toValue(owner).id ? 'Você' : toValue(owner).name

const guilds = syncList()

const openGuildPage = (guild: Resource<Guild>) =>
  router.push({ name: 'adventures', params: { guildId: guild.id } })
</script>

<template>
  <div class="guilds-index">
    <Typography variant="title">Suas guildas</Typography>

    <div class="guilds">
      <div
        class="guild"
        v-for="guild in guilds"
        :key="guild.id"
        @click="openGuildPage(guild)"
      >
        <!-- Nome e dono -->
        <div class="identification">
          <Typography class="text">{{ guild.name }}</Typography>

          <div class="owner" v-if="toValue(guild.owner)">
            <font-awesome-icon :icon="['fas', 'crown']" />
            <Typography variant="paragraph-secondary">{{
              getOwnerLabel(toValue(guild.owner))
            }}</Typography>
          </div>

          <LoadingSpinner v-else />
        </div>
      </div>

      <div class="add-guild" @click="newGuild">
        <font-awesome-icon :icon="['fas', 'plus']" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.text {
  color: var(--tx-white);
  font-weight: 600;
}

.guilds-index {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  max-width: 100%;
  padding: 0 1.5rem 2rem;

  .guilds {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    width: 50rem;
    max-width: 100%;

    --min-height: 4rem;

    .guild {
      align-items: center;
      border-radius: $border-radius;
      padding: 0.5rem 1rem;
      background-color: var(--bg-main-light);
      min-height: var(--min-height);

      @include bevel(var(--main-lighter));
      @include high-contrast-border;

      .identification {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;

        .owner {
          align-items: center;
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
}
</style>
@/utils/types