<script lang="ts" setup>
import { useCurrentGuild } from '@/api/resourcePaths/guilds'
import { useCurrentPlayer } from '@/api/resourcePaths/players'
import { BackButton, LoadingSpinner } from '@/components'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { GuildPanel } from './GuildPanel'

const { guild } = storeToRefs(useCurrentGuild())
const { player } = storeToRefs(useCurrentPlayer())

/** Quando o jogador nao eh membro nem dono da guilda */
const isVisitor = computed(
  () =>
    guild.value.ownerUid !== player.value.id &&
    guild.value.players.every((member) => member.id !== player.value.id)
)
</script>

<template>
  <template v-if="guild == null"><LoadingSpinner class="loading" /></template>

  <template v-else>
    <BackButton v-if="isVisitor" />

    <GuildPanel v-else :guild="guild" />

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
