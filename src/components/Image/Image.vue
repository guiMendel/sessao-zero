<script setup lang="ts">
import { ref, watch } from 'vue'
import { LoadingSpinner } from '..'

const props = defineProps<{
  src: string | undefined
  backupSrc: string
  hasLoaded: boolean
  alt?: string
}>()

/** Se a a imagem do src ja foi carregada pelo elemento img */
const imgHasLoaded = ref(false)

/** Se houve algum error com o src atual da img */
const imgHasError = ref(false)

const oldSrc = ref<(typeof props)['src']>(undefined)

watch(
  props,
  ({ src }) => {
    if (oldSrc.value === src) return

    oldSrc.value = src

    imgHasLoaded.value = false
    imgHasError.value = false
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="image"
    :class="{
      'has-loaded': hasLoaded && imgHasLoaded,
      'has-error': imgHasError,
    }"
  >
    <img
      :src="imgHasError ? backupSrc : src ?? backupSrc"
      :alt="alt"
      @load="imgHasLoaded = true"
      @error="imgHasError = true"
    />

    <div class="spinner-overlay">
      <LoadingSpinner class="spinner" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.image {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  position: relative;
  overflow: clip;

  &.has-loaded,
  &.has-error {
    img {
      opacity: 1;
    }

    .spinner-overlay {
      opacity: 0;
    }
  }

  img {
    transform: all 200ms;
    opacity: 0;
  }

  .spinner-overlay {
    position: absolute;
    transition: all 200ms;

    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    background-color: var(--main-washed);
    filter: brightness(1.03);

    flex-direction: column;
    align-items: center;
    justify-content: center;

    .spinner {
      font-size: 2.4rem;
    }
  }
}
</style>
