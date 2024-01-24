<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown, DropdownProps } from '../Dropdown'
import { onClickOutside } from '@vueuse/core'

withDefaults(
  defineProps<
    Pick<
      DropdownProps,
      'align' | 'marginX' | 'marginY' | 'boundingContainer'
    > & { icon?: string }
  >(),
  {
    icon: 'ellipsis-vertical',
  }
)

const isOpen = ref(false)

const target = ref<HTMLElement | null>(null)

onClickOutside(target, () => (isOpen.value = false))
</script>

<template>
  <div class="dropdown-icon" @click="isOpen = !isOpen" ref="target">
    <font-awesome-icon :icon="['fas', icon]" />
  </div>

  <Dropdown
    :is-open="isOpen"
    :anchor="target"
    :align="align"
    :margin-x="marginX"
    :margin-y="marginY"
    :bounding-container="boundingContainer"
    ><slot></slot
  ></Dropdown>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dropdown-icon {
  font-size: 1.4rem;
  color: var(--tx-main-dark);
  border: 0.7rem solid var(--trans);
  cursor: pointer;
}
</style>
