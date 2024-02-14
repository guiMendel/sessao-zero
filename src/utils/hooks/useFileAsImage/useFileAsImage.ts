import { Ref, onBeforeUnmount, watch } from 'vue'

type FileAsImageOptions = {
  onImageLoad?: VoidFunction
}

export const useFileAsImage = (
  file: Ref<File | undefined>,
  image: Ref<HTMLImageElement | null | undefined>,
  options?: FileAsImageOptions
) => {
  watch(file, (file) => {
    // Limpa a url antiga se ja tinha uma imagem
    if (image.value != null) {
      URL.revokeObjectURL(image.value.src)
    }

    // Se o arquivo for nulo, limpa a imagem
    if (file == null) {
      if (options?.onImageLoad)
        image.value?.removeEventListener('load', options.onImageLoad)

      image.value = null

      return
    }

    // Garante que ha um objeto
    if (image.value == null) {
      image.value = new Image()

      if (options?.onImageLoad)
        image.value.addEventListener('load', options.onImageLoad)
    }

    // Gera uma URL pra imagem
    image.value.src = URL.createObjectURL(file)
  })

  // Limpa a url
  onBeforeUnmount(() => {
    if (image.value != null) {
      URL.revokeObjectURL(image.value.src)

      if (options?.onImageLoad)
        image.value.removeEventListener('load', options.onImageLoad)
    }
  })
}
