import { ComputedRef, Ref, ref, watch } from 'vue'

type DrawnOnCanvasParams = {
  image: Ref<HTMLImageElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  cropPadding: ComputedRef<number>
  pan: Ref<{
    x: number
    y: number
  }>
  zoom: Ref<number>
}

export const useDrawOnCanvas = ({
  image,
  canvas,
  cropPadding,
  pan,
  zoom,
}: DrawnOnCanvasParams) => {
  /** Proporcao a ser aplicada na imagem com base no tamanho da tela e do padding */
  const sizeRatio = ref(1)

  // Quando o zoom mudar, atualiza a imagem
  watch(zoom, (newZoom, oldZoom) => {
    const change = newZoom / oldZoom

    pan.value.x *= change
    pan.value.y *= change

    updateCanvas()
  })

  const updateSizeRatio = () => {
    const oldRatio = sizeRatio.value

    if (
      image.value == undefined ||
      canvas.value == undefined ||
      image.value.width == 0 ||
      image.value.height == 0
    ) {
      sizeRatio.value = 1
      return
    }

    sizeRatio.value =
      image.value.width < image.value.height
        ? (canvas.value.width - cropPadding.value * 2) / image.value.width
        : (canvas.value.height - cropPadding.value * 2) / image.value.height

    if (oldRatio != 0) {
      const change = sizeRatio.value / oldRatio

      pan.value.x *= change
      pan.value.y *= change
    }
  }

  const updateCanvas = () => {
    // Se nao ha imagem, ignora
    if (image.value == null || canvas.value == undefined) return

    // Pega o context do canvas
    const context = canvas.value.getContext('2d')!

    // Apaga o canvas
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.value.width, canvas.value.height)

    // Desenha a imagem
    drawImage(canvas.value, image.value)

    // Desenha as bordas de crop
    drawCropBorders(canvas.value)
  }

  /** Desenha uma imagem no editor */
  const drawImage = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    // Pega o context do canvas
    const context = canvas.getContext('2d')

    if (!context) return

    updateSizeRatio()

    const [correctedWidth, correctedHeight] = [
      image.width * sizeRatio.value * zoom.value,
      image.height * sizeRatio.value * zoom.value,
    ]

    // Limita o pan baseado no tamanho da imagem
    const maxPanX = Math.max(
      (correctedWidth - (canvas.width - cropPadding.value * 2)) / 2,
      0
    )
    const maxPanY = Math.max(
      (correctedHeight - (canvas.height - cropPadding.value * 2)) / 2,
      0
    )

    if (Math.abs(pan.value.x) > maxPanX) {
      const sign = pan.value.x > 0 ? 1 : -1
      pan.value.x = maxPanX * sign
    }
    if (Math.abs(pan.value.y) > maxPanY) {
      const sign = pan.value.y > 0 ? 1 : -1
      pan.value.y = maxPanY * sign
    }

    const [positionX, positionY] = [
      canvas.width / 2 - correctedWidth / 2 + pan.value.x,
      canvas.height / 2 - correctedHeight / 2 + pan.value.y,
    ]

    // Desenha a imagem no canvas
    context.drawImage(
      image,
      positionX,
      positionY,
      correctedWidth,
      correctedHeight
    )
  }

  /** Desenha as bordas escuras que indicam a area de recorte */
  const drawCropBorders = (canvas: HTMLCanvasElement) => {
    if (cropPadding.value == 0) return

    // Tamanho das linhas delimitadoras, em proporcao total da largura
    const delimiterProportion = 0.2

    // Pega o context do canvas
    const context = canvas.getContext('2d')!

    // Pega o preto meio transparente
    context.fillStyle = 'rgba(0,0,0,0.3)'

    // Tira superior
    context.fillRect(0, 0, canvas.width, cropPadding.value)
    // Inferior
    context.fillRect(
      0,
      canvas.height - cropPadding.value,
      canvas.width,
      cropPadding.value
    )
    // Esquerda
    context.fillRect(
      0,
      cropPadding.value - 0.1,
      cropPadding.value,
      canvas.height - cropPadding.value * 2 + 0.2
    )
    // Direita
    context.fillRect(
      canvas.width - cropPadding.value,
      cropPadding.value - 0.1,
      cropPadding.value,
      canvas.height - cropPadding.value * 2 + 0.2
    )

    // Pega um cinza escuro
    context.strokeStyle = 'rgb(0,0,0)'

    const frameWidth = canvas.width - cropPadding.value * 2
    const frameHeight = canvas.height - cropPadding.value * 2

    // Desenha os trastejados
    context.lineWidth = 1
    dashLine(
      context,
      cropPadding.value - context.lineWidth,
      0,
      cropPadding.value - context.lineWidth,
      canvas.height
    )
    dashLine(
      context,
      cropPadding.value + frameWidth + context.lineWidth,
      0,
      cropPadding.value + frameWidth + context.lineWidth,
      canvas.height
    )
    dashLine(
      context,
      0,
      cropPadding.value - context.lineWidth,
      canvas.width,
      cropPadding.value - context.lineWidth
    )
    dashLine(
      context,
      0,
      cropPadding.value + frameHeight + context.lineWidth,
      canvas.width,
      cropPadding.value + frameHeight + context.lineWidth
    )

    context.lineWidth = 2

    const delimiterSize =
      (delimiterProportion / 2) * (canvas.width - cropPadding.value * 2)

    // Desenha umas linhas delimitadoras nos cantos
    const topLeft = new Path2D()
    topLeft.moveTo(
      cropPadding.value + delimiterSize - context.lineWidth / 2,
      cropPadding.value - context.lineWidth / 2
    )
    topLeft.lineTo(
      cropPadding.value - context.lineWidth / 2,
      cropPadding.value - context.lineWidth / 2
    )
    topLeft.lineTo(
      cropPadding.value - context.lineWidth / 2,
      cropPadding.value + delimiterSize - context.lineWidth / 2
    )

    context.stroke(topLeft)

    const bottomLeft = new Path2D()
    bottomLeft.moveTo(
      cropPadding.value + delimiterSize - context.lineWidth / 2,
      cropPadding.value + frameHeight + context.lineWidth / 2
    )
    bottomLeft.lineTo(
      cropPadding.value - context.lineWidth / 2,
      cropPadding.value + frameHeight + context.lineWidth / 2
    )
    bottomLeft.lineTo(
      cropPadding.value - context.lineWidth / 2,
      cropPadding.value - delimiterSize + frameHeight + context.lineWidth / 2
    )

    context.stroke(bottomLeft)

    const bottomRight = new Path2D()
    bottomRight.moveTo(
      cropPadding.value + frameWidth - delimiterSize + context.lineWidth / 2,
      cropPadding.value + frameHeight + context.lineWidth / 2
    )
    bottomRight.lineTo(
      cropPadding.value + frameWidth + context.lineWidth / 2,
      cropPadding.value + frameHeight + context.lineWidth / 2
    )
    bottomRight.lineTo(
      cropPadding.value + frameWidth + context.lineWidth / 2,
      cropPadding.value + frameHeight - delimiterSize + context.lineWidth / 2
    )

    context.stroke(bottomRight)

    const topRight = new Path2D()
    topRight.moveTo(
      cropPadding.value + frameWidth - delimiterSize + context.lineWidth / 2,
      cropPadding.value - context.lineWidth / 2
    )
    topRight.lineTo(
      cropPadding.value + frameWidth + context.lineWidth / 2,
      cropPadding.value - context.lineWidth / 2
    )
    topRight.lineTo(
      cropPadding.value + frameWidth + context.lineWidth / 2,
      cropPadding.value + delimiterSize - context.lineWidth / 2
    )

    context.stroke(topRight)
  }

  /** Trasteja uma linha */
  const dashLine = (
    context: CanvasRenderingContext2D,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    dashSize = 10,
    gapSize = 10
  ) => {
    // Pega o angulo da linha
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX)

    // Calcula um incremento em coordenadas baseado no deslocamento da caneta
    const getIncrement = (displacement: number) => ({
      x: Math.cos(angle) * displacement,
      y: Math.sin(angle) * displacement,
    })

    // Calcula os incremento do dash
    const dashIncrement = getIncrement(dashSize)
    const gapIncrement = getIncrement(gapSize)

    // Posicao inicial
    const penPosition = { x: sourceX, y: sourceY }

    const path = new Path2D()

    path.moveTo(penPosition.x, penPosition.y)

    // Define se eh hora de desenhar ou pular
    let isDashCycle = true

    // Enquanto a caneta nao chegar ou passar do destino
    while (true) {
      // Calcula a distancia da caneta ate o destino
      const penDistanceSquared =
        Math.pow(targetY - penPosition.y, 2) +
        Math.pow(targetX - penPosition.x, 2)

      // Pega distancia que sera percorrida neste ciclo
      const cycleDisplacement = isDashCycle ? dashSize : gapSize

      let increment: ReturnType<typeof getIncrement>
      let lastCycle = false

      // Verifica se ja esta perto o suficiente
      if (cycleDisplacement * cycleDisplacement >= penDistanceSquared) {
        increment = getIncrement(Math.sqrt(penDistanceSquared))
        lastCycle = true
      } else increment = isDashCycle ? dashIncrement : gapIncrement

      const drawMethod = isDashCycle
        ? (x: number, y: number) => path.lineTo(x, y)
        : (x: number, y: number) => path.moveTo(x, y)

      // Incrementa a posicao da caneta
      penPosition.x = penPosition.x + increment.x
      penPosition.y = penPosition.y + increment.y

      // Desenha
      drawMethod(penPosition.x, penPosition.y)

      isDashCycle = !isDashCycle

      if (lastCycle) break
    }

    context.stroke(path)
  }

  // Atualiza quando mudar o canvas tambem (mudanca de magem ja atualiza)
  watch(canvas, updateCanvas)

  return { updateCanvas }
}
