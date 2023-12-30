<script lang="ts" setup>
import { isMember, useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { BackButton, LoadingSpinner } from '@/components'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { GuildPanel } from './GuildPanel'
import { JoinGuildPrompt } from './JoinGuildPrompt'

const { guild } = storeToRefs(useCurrentGuild())
const { player } = storeToRefs(useCurrentPlayer())

/** Quando o jogador nao eh membro nem dono da guilda */
const isVisitor = computed(() => !isMember(player.value, guild.value))
</script>

<template>
  <template v-if="guild == null"><LoadingSpinner class="loading" /></template>

  <template v-else>
    <BackButton v-if="isVisitor" />

    <GuildPanel v-else :guild="guild" />

    <JoinGuildPrompt class="join-prompt" :guild="guild" />

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

.join-prompt {
  margin-top: 1rem;
}
</style>
@/api/guilds@/api/players
