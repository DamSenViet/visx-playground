export const createOffscreenCanvas = () => new OffscreenCanvas(300, 300)

export const measureTextByElement = (
  text: string,
  element: HTMLElement,
  canvas: HTMLCanvasElement | OffscreenCanvas = createOffscreenCanvas()
) => {
  const ctx = canvas.getContext('2d')
  const resolvedCtx = ctx ? ctx : createOffscreenCanvas().getContext('2d')!

  resolvedCtx.font = getComputedStyle(element).font
  return resolvedCtx.measureText(text)
}

export const measureTextByFont = (
  text: string,
  font: string,
  canvas: HTMLCanvasElement | OffscreenCanvas = createOffscreenCanvas()
) => {
  const ctx = canvas.getContext('2d')
  const resolvedCtx = ctx ? ctx : createOffscreenCanvas().getContext('2d')!

  resolvedCtx.font = font
  return resolvedCtx.measureText(text)
}

/**
 * Calculates the vertical height of the text as wowuld be rendered in SVG.
 * @param txtMetrics
 * @returns
 */
export const getTextMetricHeight = (txtMetrics: TextMetrics) => {
  return txtMetrics.fontBoundingBoxAscent + txtMetrics.fontBoundingBoxDescent
}

/**
 * Calculates the horizontal  width of the text as would be rendered in SVG.
 * Note: this is accurate for bounding box, but not EXACT (intentional)
 * Exact measurements take away a bit of advance when using font slant.
 * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#measuring_text_width
 * @param txtMetrics
 * @returns
 */
export const getTextMetricWidth = (txtMetrics: TextMetrics) => {
  return txtMetrics.width
}

/**
 * Compbined calculation of text for ease of use.
 * @param txtMetrics
 * @returns
 */
export const getTextMetricDims = (txtMetrics: TextMetrics) => {
  return {
    height: getTextMetricHeight(txtMetrics),
    width: getTextMetricWidth(txtMetrics),
  }
}

/**
 * Computes the size of the axis given labels, font, and tick info.
 * @param labels
 * @param font
 * @param tickLength
 * @param tickLabelMargin
 * @param orientation
 * @returns
 */
export const getAxisSize = (
  labels: string[] = [],
  font: string,
  tickLength: number,
  tickLabelMargin: number,
  dimension: 'width' | 'height'
) => {
  // we're operating on height, add an 'X" to list of labels
  const txtsMetrics = labels.map((label) => measureTextByFont(label, font))
  const txtSizes = txtsMetrics.map(
    dimension === 'height' ? getTextMetricHeight : getTextMetricWidth
  )
  console.log(labels, txtsMetrics)
  return Math.max(0, ...txtSizes) + tickLength + tickLabelMargin
}
