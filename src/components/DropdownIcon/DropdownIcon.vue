<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown } from '..'
import { onClickOutside } from '@vueuse/core'

withDefaults(defineProps<{ icon: string }>(), { icon: 'ellipsis-vertical' })

const isOpen = ref(false)

const target = ref(null)

onClickOutside(target, () => (isOpen.value = false))
</script>

<template>
  <div class="dropdown-icon" @click="isOpen = !isOpen" ref="target">
    <font-awesome-icon :icon="['fas', icon]" />

    <Dropdown :is-open="isOpen"><slot></slot></Dropdown>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dropdown-icon {
  font-size: 1.4rem;
  color: var(--tx-main-dark);
  border: 0.7rem solid var(--trans);
}
</style>
