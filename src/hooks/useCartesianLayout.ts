import { defaults } from 'lodash-es'
import { Positional } from '../types/types'
import { getAxisSize } from '../utils/measure'
import { useMemo } from 'react'

interface CartesianLayoutAxisOptions {
  /**
   * The label for the axis.
   */
  label?: string
  /**
   * Scale dictating the values on the domain.
   * We don't care about values on the
   */
  scale: unknown
  /**
   * Whether to show the axis.
   */
  show?: boolean
  /**
   * Whether axis is internally positioned.
   */
  internal?: boolean
  /**
   * Whether label is internally positioned.
   */
  internalLabel?: boolean
  /**
   * Spacing in px between the axis and plot area when externally positioned.
   * Spacing in px between the plot area edge and the axis when internally positioned.
   */
  margin?: number
  /**
   * Whether to show the tick line.
   */
  showTickLine?: boolean
  /**
   * The tick length of the axis.
   */
  tickLineLength?: number
  /**
   * Whether to show the tick label.
   */
  showTickLabel?: boolean
  /**
   * Tick label layout strategies.
   *  Different strategies applies to different layout orientations.
   *  For horizontal axis:
   * - auto - angled if nothing fits, alternating if it kinda fits, fixed otherwise
   * - fixed - fixed layout
   * - alternating - applies offsets to alternating labels
   * - angled - applies the necessary amount of angular rotation to make the labels fit
   *  For vertical axis:
   * - fixed
   */
  tickLabelLayout?: 'auto' | 'fixed' | 'alternating' | 'angled'
  /**
   * Spacing between the tick line and the tick label.
   */
  tickLabelMargin?: number
}

type CartesianLayoutAxesOptions = Partial<
  Positional<CartesianLayoutAxisOptions>
>

interface CartesianLayoutOptions {
  /**
   * Chart width.
   */
  width: number
  /**
   * Chart height.
   */
  height: number
  /**
   * Chart axis configurations by positional component.
   */
  axes?: CartesianLayoutAxesOptions
  /**
   * Whether to animate the cartesian chart layout.
   */
  animate?: boolean
  /**
   * The margins between spacing the box and layout start.
   * Acts more like chart padding.
   * Note: axis have their own additional margin between themselves and the plot area.
   */
  margin: Partial<Positional<number>>
}

const defaultWidth = 300
const defaultHeight = 300
const defaultMargin: Positional<number> = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

/**
 * Hook to perform calculations for the cartesian chart layout.
 * Is best used when to implement the layout or process the layout data.
 * Use this directly if you need to perform multiple calculation rounds.
 * Otherwise, just use the dedicated component.
 */
export const useCartesianLayout = ({
  width = defaultWidth,
  height = defaultHeight,
  margin = defaultMargin,
}: CartesianLayoutOptions) => {
  // should return all calculations (plotArea, etc)

  const bottomAxisTickLength = 8
  const topAxisTickLength = 8
  const leftAxisTickLength = 8
  const rightAxisTickLength = 8

  const bottomAxisTickLabelMargin = 3
  const topAxisTickLabelMargin = 3
  const leftAxisTickLabelMargin = 3
  const rightAxisTickLabelMargin = 3

  const resolvedMargin = defaults({}, margin, defaultMargin)

  // @TODO: IMPLEMENT ALTERNATING TICK LABEL CALCS INTO THE AXIS DIMENSIONS
  // line height dependent
  const altBottomAxisTickLabels = false
  const altTopAxisTickLabels = false
  const altLeftAxisTickLabels = false
  const altRightAxisTickLabels = false

  // need to know the labels
  // pull these off the incoming scales in props
  // call the tick function and also take a format
  const bottomAxisTickLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th']
  const topAxisTickLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th']
  const leftAxisTickLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th']
  const rightAxisTickLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th']

  // const randomScale = scaleLinear([0, 200], [100, 300])
  // const formatter = randomScale.tickFormat(20, '$.2f')
  // console.log(randomScale.ticks().map(formatter))

  // must choose primary scales in each direction
  // const primaryXScale = [bottomAxisScale, topAxisScale].filter(Boolean).get(0)!
  // const primaryYScale = [leftAxisScale, rightAxisScale].filter(Boolean).get(0)!

  const showBottomAxis = true
  const showTopAxis = true
  const showLeftAxis = true
  const showRightAxis = true

  const isBottomAxisInternal = false
  const isTopAxisInternal = false
  const isLeftAxisInternal = false
  const isRightAxisInternal = false

  const bottomAxisMargin = showBottomAxis ? 50 : 0
  const topAxisMargin = showTopAxis ? 50 : 0
  const leftAxisMargin = showLeftAxis ? 50 : 0
  const rightAxisMargin = showRightAxis ? 50 : 0

  const bottomAxisHeight = useMemo(() => {
    if (!showBottomAxis) return 0
    const dim = getAxisSize(
      bottomAxisTickLabels,
      '10px / 15.7143px Arial',
      bottomAxisTickLength,
      bottomAxisTickLabelMargin,
      'height'
    )
    return dim
  }, [showBottomAxis, bottomAxisTickLabels])

  const topAxisHeight = useMemo(() => {
    if (!showTopAxis) return 0
    const dim = getAxisSize(
      topAxisTickLabels,
      '10px / 15.7143px Arial',
      topAxisTickLength,
      topAxisTickLabelMargin,
      'height'
    )
    return dim
  }, [showTopAxis, topAxisTickLabels])

  const leftAxisWidth = useMemo(() => {
    if (!showLeftAxis) return 0
    const dim = getAxisSize(
      leftAxisTickLabels,
      '10px / 15.7143px Arial',
      leftAxisTickLength,
      leftAxisTickLabelMargin,
      'width'
    )
    return dim
  }, [showLeftAxis, leftAxisTickLabels])

  const rightAxisWidth = useMemo(() => {
    if (!showRightAxis) return 0
    const dim = getAxisSize(
      rightAxisTickLabels,
      '10px / 15.7143px Arial',
      rightAxisTickLength,
      rightAxisTickLabelMargin,
      'width'
    )
    return dim
  }, [showRightAxis, rightAxisTickLabels])

  const bottomSectionHeight = isBottomAxisInternal
    ? 0
    : bottomAxisHeight + bottomAxisMargin
  const topSectionHeight = isTopAxisInternal ? 0 : topAxisHeight + topAxisMargin
  const leftSectionWidth = isLeftAxisInternal
    ? 0
    : leftAxisWidth + leftAxisMargin
  const rightSectionWidth = isRightAxisInternal
    ? 0
    : rightAxisWidth + rightAxisMargin

  let plotHeight = Math.max(
    height - resolvedMargin.top - resolvedMargin.bottom,
    0
  )
  if (showTopAxis && !isTopAxisInternal)
    plotHeight = Math.max(plotHeight - topSectionHeight, 0)
  if (showBottomAxis && !isBottomAxisInternal)
    plotHeight = Math.max(plotHeight - bottomSectionHeight, 0)

  let plotWidth = Math.max(
    width - resolvedMargin.left - resolvedMargin.right,
    0
  )
  if (showLeftAxis && !isLeftAxisInternal)
    plotWidth = Math.max(plotWidth - leftSectionWidth, 0)
  if (showRightAxis && !isRightAxisInternal)
    plotWidth = Math.max(plotWidth - rightSectionWidth, 0)

  return {
    showTopAxis,
    showBottomAxis,
    showLeftAxis,
    showRightAxis,

    isTopAxisInternal,
    isBottomAxisInternal,
    isLeftAxisInternal,
    isRightAxisInternal,

    topAxisMargin,
    bottomAxisMargin,
    leftAxisMargin,
    rightAxisMargin,

    topAxisHeight,
    bottomAxisHeight,
    leftAxisWidth,
    rightAxisWidth,

    topSectionHeight,
    bottomSectionHeight,
    leftSectionWidth,
    rightSectionWidth,

    plotHeight,
    plotWidth,
  }
}
