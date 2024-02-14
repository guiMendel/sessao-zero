<script setup lang="ts">
import genericBanner from '@/assets/green-table.png'
import { onBeforeUnmount, ref, watch } from 'vue'
import { Typography } from '..'
import { getId } from '../../utils/functions/getId'
import { useImageCropper } from '@/stores'

defineProps<{
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
  const cropped = await cropImage(file, [16, 9])

  emit('update:modelValue', cropped)
}

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

  if (!event.dataTransfer) return

  const { files } = event.dataTransfer

  if (files.length > 0) handleFile(files[0])

  isDraggingOverZone.value = false
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
      accept="image/png,image/jpg,image/jpeg"
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
        <img
          :src="genericBanner"
          alt="preview do arquivo"
          class="file-preview"
        />

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
      min-height: $field-height;
      transition: all 200ms;

      .file-preview {
        width: 100%;
        border-radius: $border-radius;
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
