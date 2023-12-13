<script lang="ts" setup>
import { useCurrentGuild } from '@/api'
import { LoadingSpinner } from '@/components'
import { storeToRefs } from 'pinia'
import { GuildPanel } from './GuildPanel'

const { guild } = storeToRefs(useCurrentGuild())
</script>

<template>
  <template v-if="guild == null"><LoadingSpinner class="loading" /></template>

  <template v-else>
    <GuildPanel :guild="guild" />

    <div class="guild">
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
  padding: 0 1.5rem 2rem;
}
</style>
