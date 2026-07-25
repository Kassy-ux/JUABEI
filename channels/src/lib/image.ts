import type { ExportAssessmentRequest } from '../contracts/export-assessment'

const MAX_SOURCE_BYTES = 12 * 1024 * 1024
const MAX_EDGE_PX = 1024

type SupportedMimeType = ExportAssessmentRequest['mimeType']

export type EncodedImage = {
  imageBase64: string
  mimeType: SupportedMimeType
  previewUrl: string
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () =>
      reject(new Error('The selected image could not be read.'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(blob)
  })
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('The selected file is not a readable crop photo.'))
    }
    image.src = objectUrl
  })
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  mimeType: SupportedMimeType,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else
          reject(new Error('The crop photo could not be prepared for upload.'))
      },
      mimeType,
      mimeType === 'image/png' ? undefined : 0.82,
    )
  })
}

export async function prepareCropImage(file: File): Promise<EncodedImage> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Choose a photo smaller than 12 MB.')
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP crop photo.')
  }

  const image = await loadImage(file)
  const scale = Math.min(
    1,
    MAX_EDGE_PX / Math.max(image.naturalWidth, image.naturalHeight),
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot prepare the crop photo.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const mimeType = file.type as SupportedMimeType
  const blob = await canvasBlob(canvas, mimeType)
  const dataUrl = await readAsDataUrl(blob)

  return {
    imageBase64: dataUrl.slice(dataUrl.indexOf(',') + 1),
    mimeType,
    previewUrl: URL.createObjectURL(blob),
  }
}
