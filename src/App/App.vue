<script setup lang="ts">
import { BackButton } from '@/components'
import { authenticationGuard } from '@/router/guard/authenticationGuard'
import { findMeta } from '@/router/utils'
import { useAccessibility, useCurrentAuth } from '@/stores/'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alerts } from './Alerts'
import { AutosaveNotification } from './AutosaveNotification'
import { InputGetter } from './InputGetter'

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

const { listenToAuthChange } = useCurrentAuth()

listenToAuthChange(async () => {
  // Check if re-route is necessary
  const reroute = await authenticationGuard(router.currentRoute.value)

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
    <!-- Lista flutuante de notificacoes -->
    <Alerts />

    <!-- Mostra resultado do autosave -->
    <AutosaveNotification />

    <!-- Captura solicitaçoes de input -->
    <InputGetter />

    <!-- Botao de voltar de pagina -->
    <BackButton v-if="!hideBackButton" class="back-button" />

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
./Alerts
