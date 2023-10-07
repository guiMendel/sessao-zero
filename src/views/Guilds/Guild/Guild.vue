<script lang="ts" setup>
import { useGuildAPI } from '@/api'
import { LoadingSpinner, Typography } from '@/components'
import { useRoute } from 'vue-router'
import { GuildPanel } from './GuildPanel'

const { sync } = useGuildAPI()
const route = useRoute()

const guild = sync(route.params.guildId as string)
</script>

<template>
  <template v-if="guild == null"><LoadingSpinner class="loading" /></template>

  <template v-else>
    <div class="guild">
      <GuildPanel />

      <Typography class="color-light">guilda</Typography>
      <Typography class="title" variant="title">{{ guild.name }}</Typography>

      <RouterView />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.loading {
  font-size: 2rem;
  margin-top: 4rem;
}

.guild {
  flex-direction: column;
  width: 100%;
  flex: 1;
  padding: 1.5rem 1.5rem 2rem;

  .color-light {
    color: var(--tx-main-light);
    font-weight: 500;
  }

  .title {
    color: var(--tx-main-darker);
    text-align: left;
  }
}
</style>
