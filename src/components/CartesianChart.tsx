import { Orientation } from '@visx/axis'
import { Group } from '@visx/group'
import {
  AnimatedAxis,
  AnimatedGridColumns,
  AnimatedGridRows,
} from '@visx/react-spring'
import { scaleBand, scaleOrdinal } from 'd3-scale'
import { ReactNode, useMemo } from 'react'
import { getAxisSize } from './measure'
import { uniq } from 'lodash-es'

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

  // @TODO: IMPLEMENT ALL RELATED CALCULATIONS
  const bottomChartPadding = 0
  const topChartPadding = 0
  const leftChartPadding = 0
  const rightChartPadding = 0

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
  // if scales are bands, need to compute another derived scale
  // where outer padding is effectively 0
  const bottomAxisScale = useMemo(
    () =>
      scaleBand(bottomAxisTickLabels, [0, plotWidth])
        .paddingOuter(0.5)
        .paddingInner(0),
    [bottomAxisTickLabels, plotWidth]
  )
  const topAxisScale = useMemo(
    () =>
      scaleBand(topAxisTickLabels, [0, plotWidth])
        .paddingOuter(0.5)
        .paddingInner(0),
    [topAxisTickLabels, plotWidth]
  )
  const leftAxisScale = useMemo(
    () =>
      scaleBand(leftAxisTickLabels, [0, plotHeight])
        .paddingOuter(0.5)
        .paddingInner(0),
    [leftAxisTickLabels, plotHeight]
  )
  const rightAxisScale = useMemo(
    () =>
      scaleBand(rightAxisTickLabels, [0, plotHeight])
        .paddingOuter(0.5)
        .paddingInner(0),
    [rightAxisTickLabels, plotHeight]
  )

  // Grid lines need their own scales, use the primary scales for lines
  // TODO: component for gridColumnRects and gridRowRects, these will layer under the lines
  // maybe 4 different grid columns
  // could have combo chart using multiple grids of different colors
  const gridColumnStops = uniq(
    bottomAxisScale.domain().reduce((stops, val) => {
      const start = bottomAxisScale(val)!
      const end = bottomAxisScale(val)! + bottomAxisScale.bandwidth()
      stops.push(start, end)
      return stops
    }, [] as number[])
  )
  const gridColumnScale = scaleOrdinal<number>()
    .domain(['first', ...gridColumnStops, 'last'].map(String))
    .range([0, ...gridColumnStops, plotWidth])
  const gridRowStops = uniq(
    leftAxisScale.domain().reduce((stops, val) => {
      const start = leftAxisScale(val)!
      const end = leftAxisScale(val)! + leftAxisScale.bandwidth()
      stops.push(start, end)
      return stops
    }, [] as number[])
  )
  const gridRowScale = scaleOrdinal<number>()
    .domain(['first', ...gridRowStops, 'last'].map(String))
    .range([0, ...gridRowStops, plotHeight])

  const renderedPlotArea = (
    <rect
      fill="rgba(34, 34, 34, 0.4)"
      stroke="rgb(34, 34, 34)"
      width={plotWidth}
      height={plotHeight}
      x={leftSectionWidth}
      y={topSectionHeight}
    />
  )

  // use the grid scales to generate rectangles
  return (
    <svg width={width} height={height}>
      {renderedPlotArea}
      <Group
        left={leftSectionWidth}
        top={isTopAxisInternal ? 0 : topAxisHeight}
      >
        <AnimatedGridColumns
          scale={gridColumnScale}
          height={
            (isTopAxisInternal ? 0 : topAxisMargin) +
            plotHeight +
            (isBottomAxisInternal ? 0 : bottomAxisMargin)
          }
          stroke="rgba(34, 34, 34, 0.4)"
          lineStyle={{
            shapeRendering: 'crispEdges',
          }}
          animationTrajectory="center"
        />
      </Group>
      <Group
        left={isLeftAxisInternal ? 0 : leftAxisWidth}
        top={topSectionHeight}
      >
        <AnimatedGridRows
          scale={gridRowScale}
          width={
            (isLeftAxisInternal ? 0 : leftAxisMargin) +
            plotWidth +
            (isRightAxisInternal ? 0 : rightAxisMargin)
          }
          stroke="rgba(34, 34, 34, 0.4)"
          lineStyle={{
            shapeRendering: 'crispEdges',
          }}
          animationTrajectory="center"
        />
      </Group>
      {showBottomAxis ? (
        <AnimatedAxis
          orientation={Orientation.bottom}
          top={
            isBottomAxisInternal
              ? topSectionHeight + plotHeight / 2
              : topSectionHeight + plotHeight + bottomAxisMargin
          }
          left={leftSectionWidth}
          scale={bottomAxisScale}
          tickLength={bottomAxisTickLength}
          animationTrajectory="center"
        />
      ) : null}
      {showTopAxis ? (
        <AnimatedAxis
          orientation={Orientation.top}
          top={isTopAxisInternal ? plotHeight / 2 : topAxisHeight}
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
      ) : null}
      {showLeftAxis ? (
        <AnimatedAxis
          orientation={Orientation.left}
          top={topSectionHeight}
          left={isLeftAxisInternal ? plotWidth / 2 : leftAxisWidth}
          scale={leftAxisScale}
          tickLength={leftAxisTickLength}
          tickLabelProps={{
            textAnchor: 'end',
            dominantBaseline: 'middle',
            x: -leftAxisTickLabelMargin,
          }}
          animationTrajectory="center"
        />
      ) : null}
      {showRightAxis ? (
        <AnimatedAxis
          orientation={Orientation.right}
          top={topSectionHeight}
          left={
            isRightAxisInternal
              ? leftSectionWidth + plotWidth / 2
              : leftSectionWidth + plotWidth + rightAxisMargin
          }
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
      ) : null}
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
