import { defaults } from 'lodash-es'
import { Positional, PolarPositional } from '../types/types'

interface PolarLayoutAxisOptions {
  /**
   * The label for the axis.
   */
  label?: string
  /**
   * Scale dictating the values on the domain.
   */
  scale: unknown
  /**
   * Whether to show the axis.
   */
  show?: boolean
}

type PolarLayoutAxesOptions = Partial<PolarPositional<PolarLayoutAxisOptions>>

interface PolarLayoutOptions {
  /**
   * Chart width.
   */
  width: number
  /**
   * Chart height.
   */
  height: number
  /**
   * Whether to force the a square-ish polar chart.
   * Plot area dimensions are equal.
   */
  lock: boolean
  /**
   * How to align the layout inside the given box dimensions.
   * @TODO: 2d alignment values should be something like 'top left'
   */
  align: 'auto' | 'top' | 'bottom' | 'left' | 'center' | 'right'
  /**
   * Chart axis configurations by polar positional component.
   */
  axes: PolarLayoutAxesOptions
  /**
   * The margins between spacing the box and layout start.
   * Acts more like chart padding.
   * Note: axis have their own additional margin between themselves and the plot area.
   */
  margin: Partial<Positional<number>>
}

const defaultMargin: Positional<number> = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

export function usePolarLayout({ width, height, margin }: PolarLayoutOptions) {
  const resolvedMargin = defaults({}, margin, defaultMargin)

  // do we lock?

  const plotHeight = Math.max(height - resolvedMargin.top - resolvedMargin.top)
  // maybe we do some additional adjustments  here..
  const plotWidth = Math.max(width - resolvedMargin.left - resolvedMargin.right)
  // maybe we do some additional adjustmnets here..

  const resolvedPlotHeight = 0
  const resolvedPlotWidth = 0

  return {
    plotHeight,
    plotWidth,
  }
}
