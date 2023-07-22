<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAccessibility } from './stores/useAccessibility'
import { authenticationGuard } from './router/guard/authenticationGuard'
import { useCurrentPlayer } from './stores/useCurrentPlayer'
import { storeToRefs } from 'pinia'
import BackButton from './components/BackButton.vue'
import { useRoute } from 'vue-router'
import { findMeta } from './router/utils'

const router = useRouter()

// const consumeGuildInvitation = useGuildInvitationConsumer()

// ===================================================
// === BOTAO DE VOLTAR
// ===================================================

const route = useRoute()

const hideBackButton = computed(
  () => findMeta(route, 'noGoBackButton') !== undefined
)

// ===================================================
// === REAGIR A MUDANCAS DE AUTH
// ===================================================

const { player } = storeToRefs(useCurrentPlayer())

watch(player, () => {
  // Check if re-route is necessary
  const reroute = authenticationGuard(router.currentRoute.value)

  if (reroute != undefined) router.push(reroute)

  // Tambem verifica se existe um convite para guilda armazenado
  // consumeGuildInvitation()
})

// ===================================================
// === ACESSIBILIDADE
// ===================================================

const accessibility = useAccessibility()

const accessibilityClass = computed(() => ({
  'high-contrast': accessibility.highContrast,
}))
</script>

<template>
  <div id="main-container" :class="accessibilityClass">
    <!-- Botao de voltar de pagina -->
    <BackButton
      v-if="!hideBackButton"
      @click="router.back"
      class="back-button"
    />

    <!-- Pagina carregada -->
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
#main-container {
  align-items: center;
  justify-content: center;

  min-width: 100%;
  min-height: 100vh;

  .back-button {
    color: var(--tx-white);
    position: fixed;

    animation: slide-in 200ms ease-out both;

    @keyframes slide-in {
      from {
        translate: -2rem;
        opacity: 0;
        font-size: 0.5rem;
      }

      to {
        translate: 0 0;
        opacity: 1;
        font-size: 2.3rem;
      }
    }
  }
}
</style>
