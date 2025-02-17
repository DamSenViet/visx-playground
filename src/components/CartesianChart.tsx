import { Orientation } from '@visx/axis'
import { Group } from '@visx/group'
import {
  AnimatedAxis,
  AnimatedGridColumns,
  AnimatedGridRows,
} from '@visx/react-spring'
import { scaleBand, scaleLinear } from 'd3-scale'
import { ReactNode, useMemo } from 'react'
import { getAxisSize } from './measure'

interface CartesianChartProps {
  width: number
  height: number
  margin?: {
    bottom: number
    top: number
    left: number
    right: number
  }
  animate?: boolean
  children?: ({ width, height }: { width: number; height: number }) => ReactNode
}

const CartesianChart = ({ width, height, children }: CartesianChartProps) => {
  const bottomAxisTickLength = 8
  const topAxisTickLength = 8
  const leftAxisTickLength = 8
  const rightAxisTickLength = 8

  const bottomAxisTickLabelMargin = 3
  const topAxisTickLabelMargin = 3
  const leftAxisTickLabelMargin = 3
  const rightAxisTickLabelMargin = 3

  // @TODO: IMPLEMENT ALTERNATING TICK LABEL CALCS INTO THE AXIS DIMENSIONS
  const altBottomAxisTickLabels = false
  const altTopAxisTickLabels = false
  const altLeftAxisTickLabels = false
  const altRightAxisTickLabels = false

  // need to know the labels
  // pull these off the incoming scales in props
  const bottomAxisTickLabels = ['short', 'long text', 'super duper long text']
  const topAxisTickLabels = ['short', 'long text', 'super duper long text']
  const leftAxisTickLabels = ['short', 'long text', 'super duper long text']
  const rightAxisTickLabels = ['short', 'long text', 'super duper long text']

  const randomScale = scaleLinear([0, 200], [100, 300])
  const formatter = randomScale.tickFormat(20, '$.2f')
  console.log(randomScale.ticks().map(formatter))

  // must choose primary scales in each direction
  // const primaryXScale = [bottomAxisScale, topAxisScale].filter(Boolean).get(0)!
  // const primaryYScale = [leftAxisScale, rightAxisScale].filter(Boolean).get(0)!

  // Grid lines need their own scales, use the primary scales for lines
  // TODO: component for gridColumnRects and gridRowRects, these will layer under the lines
  // let gridColumnScale
  // let gridRowScale

  const showBottomAxis = true
  const showTopAxis = true
  const showLeftAxis = true
  const showRightAxis = true

  // @TODO: IMPLEMENT POSITIONING, CALCULATIONS ARE ALREADY DONE
  let isBottomAxisInternal = false
  let isTopAxisInternal = false
  let isLeftAxisInternal = false
  let isRightAxisInternal = false

  let bottomAxisMargin = 40
  let topAxisMargin = 40
  let leftAxisMargin = 40
  let rightAxisMargin = 40

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

  const bottomSectionHeight = bottomAxisHeight + bottomAxisMargin
  const topSectionHeight = topAxisHeight + topAxisMargin
  const leftSectionWidth = leftAxisWidth + leftAxisMargin
  const rightSectionWidth = rightAxisWidth + rightAxisMargin

  let plotHeight = height
  if (showBottomAxis && !isBottomAxisInternal)
    plotHeight = Math.max(plotHeight - bottomSectionHeight, 0)
  if (showTopAxis && !isTopAxisInternal)
    plotHeight = Math.max(plotHeight - topSectionHeight, 0)

  let plotWidth = width
  if (showLeftAxis && !isLeftAxisInternal)
    plotWidth = Math.max(plotWidth - leftSectionWidth, 0)
  if (showRightAxis && !isRightAxisInternal)
    plotWidth = Math.max(plotWidth - rightSectionWidth, 0)

  // memoize the scales we'll use for stable reference
  const bottomAxisScale = useMemo(
    () => scaleBand(bottomAxisTickLabels, [0, plotWidth]),
    [bottomAxisTickLabels, plotWidth]
  )
  const topAxisScale = useMemo(
    () => scaleBand(topAxisTickLabels, [0, plotWidth]),
    [topAxisTickLabels, plotWidth]
  )
  const leftAxisScale = useMemo(
    () => scaleBand(leftAxisTickLabels, [0, plotHeight]),
    [leftAxisTickLabels, plotHeight]
  )
  const rightAxisScale = useMemo(
    () => scaleBand(rightAxisTickLabels, [0, plotHeight]),
    [rightAxisTickLabels, plotHeight]
  )

  return (
    <svg width={width} height={height}>
      <rect
        fill="#000000"
        opacity={0.3}
        width={plotWidth}
        height={plotHeight}
        x={leftSectionWidth}
        y={topSectionHeight}
      />
      <Group left={leftSectionWidth} top={topAxisHeight}>
        <AnimatedGridColumns
          scale={bottomAxisScale}
          height={topAxisMargin + plotHeight + bottomAxisMargin}
          stroke="#e0e0e0"
          animationTrajectory="center"
        />
      </Group>
      <Group left={leftAxisWidth} top={topSectionHeight}>
        <AnimatedGridRows
          scale={leftAxisScale}
          width={leftAxisMargin + plotWidth + rightAxisMargin}
          stroke="#e0e0e0"
          animationTrajectory="center"
        />
      </Group>
      <AnimatedAxis
        orientation={Orientation.bottom}
        top={topSectionHeight + plotHeight + bottomAxisMargin}
        left={leftSectionWidth}
        scale={bottomAxisScale}
        tickLength={bottomAxisTickLength}
        animationTrajectory="center"
      />
      <AnimatedAxis
        orientation={Orientation.top}
        top={topAxisHeight}
        left={leftSectionWidth}
        scale={topAxisScale}
        tickLength={topAxisTickLength}
        tickLabelProps={{
          textAnchor: 'middle',
          dominantBaseline: 'text-top',
          y: -topAxisTickLabelMargin,
        }}
        animationTrajectory="center"
      />
      <AnimatedAxis
        orientation={Orientation.left}
        top={topSectionHeight}
        left={leftAxisWidth}
        scale={leftAxisScale}
        tickLength={leftAxisTickLength}
        tickLabelProps={{
          textAnchor: 'end',
          dominantBaseline: 'middle',
          x: -leftAxisTickLabelMargin,
        }}
        animationTrajectory="center"
      />
      <AnimatedAxis
        orientation={Orientation.right}
        top={topSectionHeight}
        left={leftSectionWidth + plotWidth + rightAxisMargin}
        scale={rightAxisScale}
        numTicks={15}
        tickLength={rightAxisTickLength}
        tickLabelProps={{
          textAnchor: 'start',
          dominantBaseline: 'middle',
          x: rightAxisTickLabelMargin,
        }}
        animationTrajectory="center"
      />
      {/* call inside with the calculated plot dimensions for use */}
      <>{children ? children({ width, height }) : null}</>
    </svg>
  )
}

export { CartesianChart }
export type { CartesianChartProps }
function scaleLinaer(arg0: number[], arg1: number[]) {
  throw new Error('Function not implemented.')
}
