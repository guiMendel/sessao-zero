<script lang="ts" setup>
import { useCurrentPlayer } from '@/api/players'
import {
  Button,
  Divisor,
  Drawer,
  PlayerPreview,
  ProfilePicture,
  Typography,
} from '@/components'
import { computed, ref, toValue } from 'vue'
import { useRouter } from 'vue-router'

const { player, logout } = useCurrentPlayer()
const router = useRouter()

const isOpen = ref(false)

const goToConfigurations = () => {
  router.push({ name: 'configurations' })
  isOpen.value = false
}

const goToNotifications = () => {
  if (!player.value) return

  router.push({ name: 'notifications', params: { playerId: player.value.id } })
  isOpen.value = false
}

const unreadNotifications = computed(
  () =>
    toValue(player.value?.notifications)?.filter(
      (notification) => notification.unread
    ).length ?? 0
)
</script>

<template>
  <template v-if="player != undefined">
    <div class="player-panel-toggle">
      <!-- Contagem de notificacoes -->
      <div v-if="unreadNotifications" class="notification-count">
        {{ unreadNotifications }}
      </div>

      <ProfilePicture class="picture" :player="player" @click="isOpen = true" />
    </div>

    <Drawer v-model="isOpen" class="player-panel">
      <PlayerPreview :player="player" @click="isOpen = false" />

      <Divisor class="divisor" />

      <div class="menu">
        <!-- Notificações -->
        <Button variant="colored" @click="goToNotifications" class="option">
          <font-awesome-icon :icon="['fas', 'envelope']" />
          <Typography>notificações</Typography>
        </Button>

        <!-- Configuracoes -->
        <Button variant="colored" @click="goToConfigurations" class="option">
          <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
          <Typography>configurações</Typography>
        </Button>

        <!-- Logout -->
        <Button variant="colored" @click="logout" class="option">
          <font-awesome-icon :icon="['fas', 'door-open']" />
          <Typography>sair</Typography>
        </Button>
      </div>
    </Drawer>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.player-panel-toggle {
  align-self: flex-end;

  margin: 0.5rem 1rem 0;
  position: relative;

  .picture {
    @include bevel(var(--tx-main-light));
  }

  .notification-count {
    position: absolute;
    left: -0.7rem;
    top: -0.3rem;

    background-color: var(--error-lighter);
    width: 1.2rem;
    height: 1.2rem;
    border-radius: $border-radius;
    align-items: center;
    justify-content: center;

    color: var(--tx-white);
    @include high-contrast-border;
    font-size: 0.7rem;
    font-weight: 900;
  }
}

.player-panel {
  .divisor {
    color: var(--tx-main-light);
  }

  .menu {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    min-width: max-content;
    width: 80%;
    align-self: center;

    .option {
      align-items: center;
      gap: 0.3rem;
    }
  }
}
</style>
