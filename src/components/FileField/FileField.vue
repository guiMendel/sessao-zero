<script setup lang="ts">
import { onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { Typography } from '..'
import { getId } from '../../utils/functions/getId'
import { useImageCropper } from '@/stores'

const props = defineProps<{
  /** The file to be acted upon by the field */
  modelValue: File | undefined

  /** What's the type of file that this field should handle */
  // Como so suportamos image por enquanto, ja assumimos que eh esse o tipo no codigo
  type: 'image'

  /** Shows above of the field, as a title of the field */
  label?: string

  /** Shows beneath the field, as a description/explanation */
  message?: string
}>()

const emit = defineEmits(['update:modelValue'])

const { cropImage } = useImageCropper()

const handleFile = async (file: File) => {
  const cropped = await cropImage(file, [1600, 900])

  emit('update:modelValue', cropped)
}

const validImageTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/svg',
]

// ====================================
// IMAGE PREVIEW
// ====================================

const image = ref<HTMLImageElement | null>(null)

watchEffect(() => {
  if (!image.value) return

  if (image.value.src) URL.revokeObjectURL(image.value.src)

  if (props.modelValue) image.value.src = URL.createObjectURL(props.modelValue)
})

watchEffect(() => console.log(image.value?.src))

// ====================================
// HANDLING FILE INPUT ELEMENT
// ====================================

/** O elemento de input type file */
const inputElement = ref<HTMLInputElement | null>(null)

const inputId = getId()

const handleInputEvent = ({ target }: Event) => {
  if (!target || !('files' in target)) return

  const files = target.files as FileList

  const file = files.item(0)

  if (file) handleFile(file)

  if (inputElement.value) inputElement.value.value = ''
}

// ====================================
// HANDLING DRAP AND DROP
// ====================================

const isDraggingOverZone = ref(false)

const fieldZone = ref<HTMLDivElement | null>(null)

const handleDragOver = (event: DragEvent) => {
  event.stopPropagation()
  event.preventDefault()

  // Explicitly show this is a copy operation
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'

  isDraggingOverZone.value = true
}

const handleDrop = (event: DragEvent) => {
  event.stopPropagation()
  event.preventDefault()

  isDraggingOverZone.value = false

  if (!event.dataTransfer) return

  const file = event.dataTransfer.files.item(0)

  if (!file || !validImageTypes.includes(file?.type)) return

  handleFile(file)
}

const handleDragLeave = () => (isDraggingOverZone.value = false)

watch(fieldZone, (element) => {
  if (!element) return

  element.addEventListener('dragover', handleDragOver)
  element.addEventListener('drop', handleDrop)
  element.addEventListener('dragleave', handleDragLeave)
})

onBeforeUnmount(() => {
  if (!fieldZone.value) return

  fieldZone.value.removeEventListener('dragover', handleDragOver)
  fieldZone.value.removeEventListener('drop', handleDrop)
})
</script>

<template>
  <div class="file-field">
    <Typography class="label" v-if="label != undefined">{{ label }}</Typography>

    <!-- Input invisivel -->
    <input
      type="file"
      ref="inputElement"
      @change="handleInputEvent"
      class="hidden-input"
      :id="inputId"
      :accept="validImageTypes.join(',')"
    />

    <div
      class="field"
      ref="fieldZone"
      :class="{ 'show-drag-prompt': isDraggingOverZone }"
    >
      <div class="drag-here-prompt">
        <font-awesome-icon
          class="icon"
          :icon="['fas', 'arrow-up-from-bracket']"
        />
        <Typography class="text">solte aqui</Typography>
      </div>

      <label class="default-view" :for="inputId">
        <!-- Preview do arquivo -->
        <div class="file-preview" :class="{ 'has-image': Boolean(image?.src) }">
          <img alt="preview do arquivo" ref="image" />

          <font-awesome-icon :icon="['far', 'file']" class="no-file-icon" />
        </div>

        <!-- Input -->
        <div class="input-area">
          <div class="upload-button">
            <font-awesome-icon :icon="['fas', 'arrow-up-from-bracket']" />upload
          </div>

          <Typography class="drag-message">ou arraste para cá</Typography>
        </div>
      </label>
    </div>

    <Typography class="message" v-if="message">
      {{ message }}
    </Typography>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

#app .file-field {
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;

  .hidden-input {
    position: absolute;
    pointer-events: none;
    opacity: 0;
  }

  .label {
    @include field-label;
  }

  .message {
    @include field-message;
  }

  .field {
    @include high-contrast-border;
    @include bevel(var(--main-light));

    border-radius: $border-radius;
    background-color: var(--main-lighter);
    padding: 0.5rem;

    max-width: 100%;
    cursor: pointer;
    position: relative;
    transition: all 200ms;

    &.show-drag-prompt {
      background-color: var(--main);
      @include bevel(var(--main-dark));

      .drag-here-prompt {
        opacity: 1;
      }

      .default-view {
        opacity: 0;
      }
    }

    .drag-here-prompt {
      position: absolute;

      top: 0.6rem;
      bottom: 0.6rem;
      left: 0.6rem;
      right: 0.6rem;

      opacity: 0;
      pointer-events: none;
      transition: all 200ms;

      align-items: center;
      justify-content: center;
      gap: 1rem;

      color: var(--tx-white);
      border: 0.3rem dashed var(--tx-main-dark);
      border-radius: $border-radius;

      .text {
        font-size: 1.2rem;
        font-weight: 700;
      }

      .icon {
        font-size: 1.6rem;
      }
    }

    .default-view {
      display: flex;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      align-items: center;
      transition: all 200ms;
      width: 100%;

      .file-preview {
        width: 100%;
        border-radius: $border-radius;
        overflow: hidden;
        position: relative;
        align-items: center;
        justify-content: center;
        min-height: 3rem;

        background-color: var(--bg-main-washed);

        &.has-image {
          img {
            opacity: 1;
          }

          .no-file-icon {
            opacity: 0;
          }
        }

        img {
          opacity: 0;
          width: 100%;
          transition: all 200ms;
        }

        .no-file-icon {
          position: absolute;
          transition: all 200ms;
          color: var(--tx-trans-3);
        }
      }

      .input-area {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;

        .upload-button {
          @include button;

          font-weight: 800;
          min-width: unset;
          padding: 0.5rem 0.8rem;
          font-size: 0.9rem;
          background-color: var(--bg-main-light);
          color: var(--tx-main-dark);
          @include bevel(var(--main));
        }

        .drag-message {
          font-size: 0.8rem;
          font-weight: 500;
          justify-content: center;
        }
      }
    }
  }

  &.enabled {
    .field {
      background-color: var(--main-lighter);
      @include bevel(var(--main-light));
    }
  }
}
</style>
