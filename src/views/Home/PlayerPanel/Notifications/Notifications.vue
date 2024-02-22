<script setup lang="ts">
import { useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import knightImage from '@/assets/happy-knight-and-donkey.png'
import { Drawer, LoadingSpinner, Typography } from '@/components'
import { toValue, watchEffect } from 'vue'

defineProps<{ modelValue: boolean }>()

const emit = defineEmits(['update:modelValue'])

const { player } = useCurrentPlayer()
const { deleteNotification, readNotification } = useNotification()

// Marca todas as notificacoes como lidas
watchEffect(() =>
  toValue(player.value?.notifications)?.forEach((notification) => {
    if (notification.unread) readNotification(notification.id)
  })
)

const deleteAll = () =>
  toValue(player.value?.notifications)?.forEach((notification) =>
    deleteNotification(notification.id)
  )
</script>

<template>
  <Drawer
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    v-if="player"
    class="notifications"
    draw-direction="bottom"
  >
    <Typography class="heading" variant="subtitle">Notificações</Typography>

    <template v-if="toValue(player.notifications).length > 0">
      <Typography class="burn-it-all" @click="deleteAll">
        limpar todas <font-awesome-icon :icon="['fas', 'fire']" />
      </Typography>

      <div
        class="notification"
        v-for="notification in toValue(player.notifications)"
        :key="notification.id"
      >
        <div class="row">
          <!-- Delete -->
          <font-awesome-icon
            :icon="['fas', 'xmark']"
            @click="deleteNotification(notification.id)"
            class="close"
          />
        </div>

        <Typography class="body" v-html="notification.body" />
      </div>
    </template>

    <template v-else>
      <Typography>Tudo em ordem!</Typography>

      <img class="knight-image" :src="knightImage" />
    </template>
  </Drawer>

  <LoadingSpinner v-else />
</template>

<style lang="scss">
@import '@/styles/variables.scss';

#app .notifications {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  padding-top: 2rem;

  .heading {
    color: var(--tx-main-dark);
  }

  .burn-it-all {
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    color: var(--tx-main);
    background-color: var(--bg-main-lighter);
    padding: 0.5rem 1rem;
    border-radius: $border-radius;
    align-self: flex-end;

    svg {
      font-size: 0.9rem;
    }
  }

  .notification {
    background-color: var(--bg-main-light);
    border-radius: $border-radius;
    padding: 0.4rem 1rem 1.2rem;
    flex-direction: column;
    @include high-contrast-border;

    .row {
      justify-content: flex-end;
      gap: 1rem;
    }

    .body {
      display: inline;
      text-align: left;
    }

    .close {
      margin-bottom: -0.4rem;
      opacity: 0.5;
    }
  }

  .knight-image {
    align-self: center;
    margin-top: 3rem;
    width: 75%;
  }
}
</style>
