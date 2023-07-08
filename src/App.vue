<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAccessibility } from './stores/useAccessibility'
import { authenticationGuard } from './router/guard/authenticationGuard'
import { useCurrentPlayer } from './stores/useCurrentPlayer'
import { storeToRefs } from 'pinia'

const router = useRouter()

// const consumeGuildInvitation = useGuildInvitationConsumer()

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
}
</style>
