<script lang="ts" setup>
import { useCurrentPlayer } from '@/api/players'
import {
  Button,
  Divisor,
  Drawer,
  NotificationsBadge,
  PlayerPreview,
  ProfilePicture,
  Typography,
} from '@/components'
import { findMeta } from '@/router/utils'
import { computed, ref, toValue } from 'vue'
import { useRouter } from 'vue-router'
import { Feedback } from './Feedback'
import { Notifications } from './Notifications'

const { player, logout } = useCurrentPlayer()
const router = useRouter()

type Panel = 'player' | 'notifications' | 'feedback' | 'bug'
const openPanel = ref<Panel | undefined>(undefined)

const picturePositionAbsolute = computed(() =>
  Boolean(findMeta(router.currentRoute.value, 'playerPanelPositionAbsolute'))
)

const goToConfigurations = () => {
  router.push({ name: 'configurations' })
  openPanel.value = undefined
}

const unreadNotifications = computed(
  () =>
    toValue(player.value?.notifications)?.filter(
      (notification) => notification.unread
    ).length ?? 0
)

const panelAsFeedback = computed(() =>
  openPanel.value === 'feedback' || openPanel.value === 'bug'
    ? openPanel.value
    : undefined
)
</script>

<template>
  <template v-if="player != undefined">
    <div
      class="player-panel-toggle"
      :class="{ absolute: picturePositionAbsolute }"
    >
      <!-- Contagem de notificacoes -->
      <NotificationsBadge :count="unreadNotifications" />

      <!-- Foto de perfil -->
      <ProfilePicture
        background="main-lighter"
        class="picture"
        :player="player"
        @click="openPanel = 'player'"
      />
    </div>

    <Notifications
      :model-value="openPanel === 'notifications'"
      @update:model-value="openPanel = undefined"
    />

    <Feedback
      :model-value="panelAsFeedback !== undefined"
      @update:model-value="openPanel = undefined"
      :type="panelAsFeedback"
    />

    <Drawer
      :model-value="openPanel === 'player'"
      @update:model-value="openPanel = undefined"
      class="player-panel"
    >
      <PlayerPreview :player="player" @click="openPanel = undefined">
        <div class="see-profile">
          <Typography variant="paragraph-secondary">perfil</Typography>

          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </div>
      </PlayerPreview>

      <Divisor class="divisor" />

      <div class="menu">
        <!-- Notificações -->
        <Button
          variant="colored"
          @click="openPanel = 'notifications'"
          class="option"
        >
          <NotificationsBadge :count="unreadNotifications" />
          <font-awesome-icon :icon="['fas', 'envelope']" />
          <Typography>notificações</Typography>
        </Button>

        <!-- Configuracoes -->
        <Button variant="colored" @click="goToConfigurations" class="option">
          <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
          <Typography>configurações</Typography>
        </Button>

        <!-- Bug report -->
        <Button variant="colored" @click="openPanel = 'bug'" class="option">
          <font-awesome-icon :icon="['fas', 'bug']" />
          <Typography>relatar bug</Typography>
        </Button>

        <!-- Feedback -->
        <Button
          variant="colored"
          @click="openPanel = 'feedback'"
          class="option"
        >
          <font-awesome-icon :icon="['fas', 'envelope-open-text']" />
          <Typography>feedback</Typography>
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

  cursor: pointer;
  transition: all 100ms;

  &.absolute {
    position: fixed;
  }

  &:hover {
    filter: brightness(1.05)
  }

  .picture {
    @include bevel(var(--tx-main-light));

    @media (min-width: 700px) {
      font-size: 1.3rem;
    }
  }
}

.player-panel {
  .see-profile {
    color: var(--tx-main);
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;

    background-color: var(--bg-main-lighter);
    padding: 0.3rem 0.8rem;
    border-radius: $border-radius;

    svg {
      font-size: 0.7rem;
    }
  }

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
