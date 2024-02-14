import { ResolveImageCrop, useAlert } from '@/stores'
import { Ref } from 'vue'

type AcceptAndCancelParams = {
  aspectRatio: Ref<[number, number]>
  canvas: Ref<null | HTMLCanvasElement>
  cropPaddingProportion: Ref<number>
  updateCanvas: VoidFunction
  recalculateCanvasSize: VoidFunction
  targetImage: Ref<File | undefined>
  resolve: Ref<ResolveImageCrop>
}

export const useAcceptAndCancel = ({
  canvas,
  aspectRatio,
  cropPaddingProportion,
  updateCanvas,
  recalculateCanvasSize,
  targetImage,
  resolve,
}: AcceptAndCancelParams) => {
  const { alert } = useAlert()

  const clearStore = () => {
    resolve.value = undefined
    targetImage.value = undefined
  }

  const accept = () => {
    if (canvas.value == null || aspectRatio.value == null) return

    const paddingBefore = cropPaddingProportion.value

    // Remove as bordas de recorte
    cropPaddingProportion.value = 0

    // Coloca o tamanho solicitado na imagem
    canvas.value.width = aspectRatio.value[0]
    canvas.value.height = aspectRatio.value[1]

    // Atualiza o canvas
    updateCanvas()

    // Gera o arquivo
    canvas.value.toBlob(
      (blob) => {
        if (!resolve.value) return

        // Retorna o crop padding
        cropPaddingProportion.value = paddingBefore

        // Recalcula o canvas
        recalculateCanvasSize()

        if (blob == null) {
          alert('error', 'Falha ao gerar imagem recortada')

          cancel()

          return
        }

        // Gera o arquivo
        const file = new File([blob], 'croppedImage.png', blob)

        // Resolve a promessa
        resolve.value(file)

        clearStore()
      },
      'image/jpeg',
      0.5
    )
  }

  const cancel = () => {
    resolve.value?.(undefined)

    resolve.value = undefined
    targetImage.value = undefined
  }

  return { accept, cancel }
}
