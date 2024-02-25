<script setup lang="ts">
import { Button } from '@/components';
import { useAccessibility } from '@/stores/useAccessibility'
import { useRouter } from 'vue-router'

// === HIGH CONTRAST TOGGLE

const router = useRouter()

const accessibility = useAccessibility()

const toggleHighContrastAndContinue = (value: boolean) => {
  // Guarda o valor
  accessibility.highContrast = value

  // Continua
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="container high-contrast">
    <!-- Mensagem -->
    <div class="message">
      <span>
        Gostaria de ativar a função de acessibilidade de alto contraste?
      </span>
      <small>Você poderá alterar suas configurações mais tarde</small>
    </div>

    <!-- Botoes -->
    <div class="control">
      <Button @click="toggleHighContrastAndContinue(true)">Sim</Button>
      <Button @click="toggleHighContrastAndContinue(false)">Não</Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;

  font-size: 1.3rem;

  width: 100%;
  height: 100vh;

  .message {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .control {
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
