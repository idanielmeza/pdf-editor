import Tesseract from 'tesseract.js'
import type { OcrData } from '../types'

export async function runOcrOnCanvas(
  canvas: HTMLCanvasElement,
  onProgress: (pct: number) => void
): Promise<OcrData> {
  const result = await Tesseract.recognize(canvas, 'spa+eng', {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        onProgress(30 + m.progress * 70)
      }
    },
  })
  return {
    lines: result.data.lines.map((l: any) => ({
      text: l.text,
      bbox: l.bbox,
    })),
  }
}
