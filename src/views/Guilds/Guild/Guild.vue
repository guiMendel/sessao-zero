<script lang="ts" setup>
import { isMember, useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { BackButton, LoadingSpinner } from '@/components'
import { setTitle } from '@/utils/functions'
import { storeToRefs } from 'pinia'
import { computed, watchEffect } from 'vue'
import { GuildPanel } from './GuildPanel'
import { JoinGuildPrompt } from './JoinGuildPrompt'

const { guild } = storeToRefs(useCurrentGuild())
const { player } = storeToRefs(useCurrentPlayer())

/** Quando o jogador nao eh membro nem dono da guilda */
const isVisitor = computed(() => !isMember(player.value, guild.value))

// TODO: ao entrar varias vezes na mesma guilda, isso para de funcionar
watchEffect(() => setTitle(guild.value?.name))
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
