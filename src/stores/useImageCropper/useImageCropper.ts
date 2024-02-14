import { ref } from 'vue'
import { defineStore } from '../defineStore'

export type ResolveImageCrop =
  | undefined
  | ((croppedImage: File | undefined) => void)

export const useImageCropper = defineStore('image-cropper', () => {
  /** O arquivo que esta atualmente sendo recortado */
  const targetImage = ref<File | undefined>(undefined)

  /** O aspect ratio para o qual queremos recortar */
  const targetAspectRatio = ref<[number, number]>([1, 1])

  /** Metodo para finalizar o crop */
  const resolve = ref<ResolveImageCrop>(undefined)

  const cropImage = async (
    image: File,
    aspectRatio: [number, number]
  ): Promise<File | undefined> =>
    new Promise((localResolve) => {
      targetImage.value = image
      targetAspectRatio.value = aspectRatio
      resolve.value = localResolve
    })

  return { cropImage, targetImage, targetAspectRatio, resolve }
})
