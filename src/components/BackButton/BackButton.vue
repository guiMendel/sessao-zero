<script setup lang="ts">
import { IconButton } from '@/components/IconButton'
import { useRouter } from 'vue-router'

type BackButtonBehavior = 'router-back' | (() => void)

const props = withDefaults(defineProps<{ behavior: BackButtonBehavior }>(), {
  behavior: 'router-back',
})

const router = useRouter()

const onClick = () => {
  if (props.behavior === 'router-back') router.back()
  else props.behavior()
}
</script>

<template>
  <div @click="onClick" class="back-button">
    <IconButton color="main-light" icon="hand-point-left" />
  </div>
</template>

<style lang="scss" scoped>
.back-button {
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  font-size: 2.3rem;

  z-index: 30;
}
</style>
