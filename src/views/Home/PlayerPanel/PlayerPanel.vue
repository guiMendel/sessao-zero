<script lang="ts" setup>
import {
  Button,
  Divisor,
  PlayerPreview,
  ProfilePicture,
  Typography,
} from '@/components'
import { useCurrentPlayer } from '@/stores'
import { ref } from 'vue'

const { player, logout } = useCurrentPlayer()

const isOpen = ref(false)
</script>

<template>
  <div class="player-panel-toggle">
    <ProfilePicture class="picture" :player="player" @click="isOpen = true" />
  </div>

  <Transition name="slide">
    <div class="shadow" v-if="isOpen" @click.self="isOpen = false">
      <div class="player-panel">
        <PlayerPreview :player="player" @click="isOpen = false" />

        <Divisor class="divisor" />

        <div class="menu">
          <!-- Configuracoes -->
          <Button variant="colored" class="option">
            <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
            <Typography>configurações</Typography>
          </Button>

          <!-- Logout -->
          <Button variant="colored" @click="logout" class="option">
            <font-awesome-icon :icon="['fas', 'door-open']" />
            <Typography>sair</Typography>
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.player-panel-toggle {
  align-self: flex-end;

  margin: 0.5rem 1rem 0;

  .picture {
    @include bevel(var(--tx-main-light));
  }
}

.shadow {
  position: fixed;
  width: 100%;
  height: 100vh;
  backdrop-filter: blur(3px);
  z-index: 100;
  flex-direction: column;

  .player-panel {
    background-color: var(--bg-main-washed);
    border-radius: 0 0 $border-radius $border-radius;
    padding: 4rem 1rem 2rem;
    margin-top: -2rem;

    box-shadow: 0 0 100px 0 var(--bg-main-dark);

    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;

    .divisor {
      color: var(--tx-main-light);
    }

    .menu {
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      flex-wrap: wrap;
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
}

.slide-enter-active {
  &.shadow {
    animation: shadow-fade 300ms;

    .player-panel {
      animation: panel-slide 300ms;
    }
  }
}

.slide-leave-active {
  &.shadow {
    animation: shadow-fade 200ms reverse;

    .player-panel {
      animation: panel-slide 200ms reverse;
    }
  }
}

@keyframes shadow-fade {
  from {
    backdrop-filter: blur(0);
  }

  to {
    backdrop-filter: blur(3px);
  }
}

@keyframes panel-slide {
  from {
    opacity: 0;
    transform: translateY(-5rem);
  }

  50% {
    opacity: 1;
    transform: translateY(0.8rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>