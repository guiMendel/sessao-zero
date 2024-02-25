<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { Dropdown, DropdownProps } from '../Dropdown'

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
  <div ref="element" class="dropdown-container">
    <div class="dropdown-icon" @click="isOpen = !isOpen" ref="target">
      <font-awesome-icon :icon="['fas', icon]" />
    </div>

    <Teleport to="#app">
      <Dropdown
        :is-open="isOpen"
        :anchor="target"
        :align="align"
        :margin-x="marginX"
        :margin-y="marginY"
        :bounding-container="boundingContainer"
        ><slot></slot
      ></Dropdown>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dropdown-container {
  position: relative;

  .dropdown-icon {
    font-size: 1.4rem;
    color: var(--tx-main-dark);
    // border: 0.7rem solid var(--trans);
    cursor: pointer;
    position: relative;

    align-items: center;
    justify-content: center;

    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;

    transition: all 100ms;

    &:hover {
      background-color: var(--trans-03);
    }
  }
}
</style>
