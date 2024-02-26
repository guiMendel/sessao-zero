<script lang="ts" setup>
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import { BackButton, LoadingSpinner } from '@/components'
import { setTitle } from '@/utils/functions'
import { computed, watchEffect } from 'vue'
import { GuildPanel } from './GuildPanel'
import { JoinGuildPrompt } from './JoinGuildPrompt'
import { hasLoaded } from '@/firevase/resources'

const { guild } = useCurrentGuild()
const { player, update } = useCurrentPlayer()

/** Quando o jogador nao eh membro nem dono da guilda */
const isVisitor = computed(() => !isMember(player.value, guild.value))

// Seta essa guilda como a preferida do jogador
watchEffect(() => {
  console.log(guild.value, hasLoaded(guild))

  if (
    !player.value ||
    isVisitor.value ||
    !guild.value ||
    player.value.preferredGuildId === guild.value.id
  )
    return

  update({ preferredGuildId: guild.value.id })
})

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
  padding-block: 1rem 2rem;
}

.join-prompt {
  margin-top: 1rem;
}
</style>
@/api/guilds@/api/players
