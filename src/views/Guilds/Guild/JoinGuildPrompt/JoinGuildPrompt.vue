<script setup lang="ts">
import { isMember } from '@/api/resourcePaths/guilds'
import { useCurrentPlayer } from '@/api/resourcePaths/players'
import { UnrefedResource } from '@/api/resources'
import { Button, Typography } from '@/components'
import { useInput } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  guild: UnrefedResource<'guilds'>
}>()

const { player } = storeToRefs(useCurrentPlayer())

const playerIsMember = computed(() => isMember(player.value, props.guild))

const { getBooleanInput } = useInput()

const join = () =>
  getBooleanInput({
    cancellable: true,
    messageHtml: `Tem certeza de que deseja se tornar membro da guilda <strong>${props.guild.name}</ strong>?`,
    trueButton: { buttonProps: { variant: 'colored' } },
  })
    .then((decision) => {
      if (!decision) return

      console.log('JOINED')
    })
    .catch(() => {})
</script>

<template>
  <div v-if="playerIsMember === false" class="join-guild-prompt">
    <div class="row">
      <font-awesome-icon :icon="['fas', 'eye']" />

      <Typography class="main-text">apenas visualizando</Typography>
    </div>

    <Typography variant="paragraph-secondary"
      >você ainda não faz parte desta guilda!</Typography
    >

    <Button class="button" @click="join">
      <font-awesome-icon :icon="['fas', 'door-open']" />
      se tornar membro
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

  .main-text {
    font-weight: 600;
    font-size: 1.06rem;
  }

  .row {
    align-items: center;
    gap: 0.6rem;
  }

  .button {
    margin-top: 0.7rem;
    color: inherit;
  }
}
</style>
