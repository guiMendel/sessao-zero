<script setup lang="ts">
import { Vase, vase } from '@/api'
import { useNotification } from '@/api/notifications'
import { Drawer, PlayerPreview, Typography } from '@/components'
import { addRelation, removeRelation } from '@/firevase/relations'
import { HalfResource, Resource } from '@/firevase/resources'
import { toValue } from 'vue'

const props = defineProps<{
  guild: Resource<Vase, 'guilds'> | undefined
  modelValue: boolean
}>()

const { notifyPlayer } = useNotification()

const emit = defineEmits(['update:modelValue'])

const rejectPlayer = async (player: HalfResource<Vase, 'players'>) =>
  props.guild &&
  removeRelation(vase, props.guild, 'admissionRequests', [player])

const acceptPlayer = async (player: HalfResource<Vase, 'players'>) => {
  if (!props.guild) return

  notifyPlayer(player.id, {
    type: 'admissionRequestAccepted',
    params: { guild: props.guild, player },
  })

  return Promise.all([
    removeRelation(vase, props.guild, 'admissionRequests', [player]),
    addRelation(vase, props.guild, 'players', [player]),
  ])
}
</script>

<template>
  <Drawer
    v-if="guild"
    :modelValue="modelValue"
    @update:modelValue="(value: boolean) => emit('update:modelValue', value)"
    draw-direction="bottom"
    class="admission-requests"
  >
    <Typography variant="subtitle" class="heading"
      >Admitir jogadores</Typography
    >

    <Typography v-if="toValue(guild.admissionRequests).length === 0"
      >sem novas solicitações</Typography
    >

    <PlayerPreview
      v-for="requestedPlayer in toValue(guild.admissionRequests)"
      :key="requestedPlayer.id"
      :player="requestedPlayer"
      background="main"
    >
      <div @click.stop class="actions">
        <font-awesome-icon
          class="admit"
          @click="acceptPlayer(requestedPlayer)"
          :icon="['fas', 'circle-check']"
        />

        <font-awesome-icon
          class="reject"
          @click="rejectPlayer(requestedPlayer)"
          :icon="['fas', 'circle-xmark']"
        />
      </div>
    </PlayerPreview>
  </Drawer>
</template>

<style lang="scss" scoped>
.admission-requests {
  .heading {
    margin-top: -1rem;
  }

  .actions {
    margin-inline: auto 0.5rem;
    gap: 1rem;
    font-size: 1.8rem;

    .admit {
      color: var(--main);
    }
  }
}
</style>
