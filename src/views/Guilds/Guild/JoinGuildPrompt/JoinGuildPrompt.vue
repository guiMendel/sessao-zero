<script setup lang="ts">
import { Vase } from '@/api'
import { isMember, useJoinGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { Button, Typography } from '@/components'
import { UnrefedResource } from '@/firevase/resources'
import { unwrapStore } from '@/utils/functions'
import { computed, toValue } from 'vue'

const props = defineProps<{
  guild: UnrefedResource<Vase, 'guilds'>
}>()

const { player } = unwrapStore(useCurrentPlayer())

const playerIsMember = computed(() => isMember(player.value, props.guild))

const joinGuild = useJoinGuild()

const playerHasRequestedAdmission = computed(() =>
  Boolean(
    toValue(player.value?.admissionRequests)?.find(
      (requestedGuild) => requestedGuild.id === props.guild.id
    )
  )
)

const heading = computed(() => {
  if (!props.guild.open) return 'guilda trancada'

  if (!props.guild.requireAdmission) return 'apenas visualizando'

  if (playerHasRequestedAdmission.value) return 'solicitação enviada'

  return 'requer admissão'
})

const subheading = computed(() => {
  if (!props.guild.open) return 'esta guilda não está aceitando novos membros'

  return 'você ainda não faz parte desta guilda!'
})

const buttonLabel = computed(() => {
  if (!props.guild.requireAdmission) return 'se tornar membro'

  if (playerHasRequestedAdmission.value) return 'cancelar solicitação'

  return 'solicitar admissão'
})
</script>

<template>
  <div
    v-if="player && playerIsMember === false"
    class="join-guild-prompt"
    :class="{ yellow: guild.requireAdmission, gray: !guild.open }"
  >
    <div class="row">
      <font-awesome-icon :icon="['fas', guild.open ? 'eye' : 'lock']" />

      <Typography class="main-text">{{ heading }}</Typography>
    </div>

    <Typography variant="paragraph-secondary" class="sub-heading">{{
      subheading
    }}</Typography>

    <Button
      v-if="guild.open"
      class="button"
      @click="joinGuild(player, guild, playerHasRequestedAdmission)"
    >
      <font-awesome-icon
        v-if="guild.requireAdmission && playerHasRequestedAdmission"
        :icon="['fas', 'ban']"
      />
      <font-awesome-icon v-else :icon="['fas', 'door-open']" />

      {{ buttonLabel }}
    </Button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.join-guild-prompt {
  width: 100%;
  background-color: var(--bg-main-light);
  @include high-contrast-border;

  text-align: left;
  color: var(--tx-white);
  font-weight: 500;

  padding: 1rem 1rem 1.2rem;
  gap: 0.2rem;
  flex-direction: column;

  &.yellow {
    background-color: var(--bg-warning-dark);
  }

  &.gray {
    background-color: var(--bg-gray);
  }

  .main-text {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .sub-heading {
    color: var(--tx-light-trans-75);
    font-weight: 500;
  }

  .row {
    align-items: center;
    gap: 0.6rem;
  }

  .button {
    margin-top: 0.7rem;
    color: inherit;
  }

  .request-sent-notice {
    margin-top: 1rem;
    font-weight: 600;
  }
}
</style>
