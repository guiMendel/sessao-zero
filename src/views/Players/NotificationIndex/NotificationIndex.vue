<script setup lang="ts">
import { useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import { LoadingSpinner, Typography } from '@/components'
import { toValue, watchEffect } from 'vue'

const { player } = useCurrentPlayer()
const { deleteNotification, readNotification } = useNotification()

// Marca todas as notificacoes como lidas
watchEffect(() =>
  toValue(player.value?.notifications)?.forEach((notification) => {
    if (notification.unread) readNotification(notification.id)
  })
)
</script>

<template>
  <div v-if="player" class="notifications">
    <Typography class="heading" variant="subtitle">Notificações</Typography>

    <Typography class="burn-it-all">
      <font-awesome-icon :icon="['fas', 'fire']" /> limpar todas
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
        />
      </div>

      <Typography class="body" v-html="notification.body" />
    </div>
  </div>

  <LoadingSpinner v-else />
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

#app .notifications {
  width: 100%;
  padding: 1.5rem 1.5rem 2rem;

  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  flex: 1;

  .heading {
    color: var(--tx-main-dark);
  }

  .burn-it-all {
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    color: var(--tx-trans-3);
    background-color: var(--bg-trans-1);
    padding: 0.5rem;
    border-radius: $border-radius;

    svg {
      font-size: 0.9rem;
    }
  }

  .notification {
    background-color: var(--bg-main-lighter);
    border-radius: $border-radius;
    padding: 0.5rem 1rem 1rem;
    flex-direction: column;

    .row {
      justify-content: flex-end;
      gap: 1rem;
    }

    .body {
      display: inline;
      text-align: left;
    }
  }
}
</style>
