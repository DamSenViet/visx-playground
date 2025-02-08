import { animate, motion, useMotionValue, AnimatePresence } from 'framer-motion'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import {
  AnimatedAxis,
  AnimatedGridRows,
  AnimatedGridColumns,
} from '@visx/react-spring'
import { Orientation } from '@visx/axis'
import { PointsRange } from '@visx/mock-data/lib/generators/genRandomNormalPoints'
import { extent } from 'd3-array'
import {
  forceSimulation,
  forceCollide,
  forceLink,
  SimulationNodeDatum,
  SimulationLinkDatum,
  forceManyBody,
} from 'd3-force'
import forceBoundary from '../forceBoundary'
import { unzip, isNil } from 'lodash-es'
import { useMemo, useEffect } from 'react'
import { SymbolType, symbol, symbolCircle } from 'd3-shape'
import { interpolate } from 'flubber'
import { ScaleOrdinal } from 'd3-scale'

const motionTransition = { type: 'spring', bounce: 0.25 } as const // const motionTransition = { duration: 0.25, ease: 'easeInOut' } as const
const delay = 0.003

// accessors
const xAccessor = (d: PointsRange) => d[0]
const yAccessor = (d: PointsRange) => d[1]
const zAccessor = (d: PointsRange) => d[2]

const defaultMargin = { top: 40, right: 50, bottom: 50, left: 40 }

export type ChartProps = {
  width: number
  height: number
  symbolScale: ScaleOrdinal<number, SymbolType, never>
  points: PointsRange[]
  margin?: { top: number; right: number; bottom: number; left: number }
  shapeSize?: number
  showLinks?: boolean
  showAnnotations?: boolean
}

interface AnnotationNode extends SimulationNodeDatum {
  type: 'annotation'
  data: string
}

interface PointNode extends SimulationNodeDatum {
  type: 'point'
  data: PointsRange
}
type MySimulationNode = PointNode | AnnotationNode
type SimulationLink = SimulationLinkDatum<MySimulationNode>

interface ShapeProps {
  shape: SymbolType
  size: number
  fill?: string
  disable?: boolean
  transition?: typeof motionTransition
}

const useMotionPathData = (d: string) => {
  const motionValue = useMotionValue<string>(d)
  const interpolator = interpolate(motionValue.get(), d, {
    maxSegmentLength: 10,
  })

  useEffect(() => {
    animate(0, 1, {
      type: 'tween',
      ease: 'easeInOut',
      onUpdate: (progress) => motionValue.set(interpolator(progress)),
    })
  }, [interpolator, motionValue])

  return motionValue
}

function Shape({
  shape = symbolCircle,
  size = 10,
  fill = '#f18686',
  transition = motionTransition,
}: ShapeProps) {
  const pathData = useMotionPathData(
    symbol<number>(shape).size(Math.pow(size, 2))()!
  )
  return <motion.path d={pathData} fill={fill} transition={transition} />
}

export default function BubbleChart({
  width,
  height,
  margin = defaultMargin,
  points,
  symbolScale,
  showAnnotations,
  showLinks,
  shapeSize = 10,
}: ChartProps) {
  const origXScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: extent(points.map(xAccessor)) as [number, number],
        nice: true,
      }),
    [points]
  )
  const origYScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: extent(points.map(yAccessor)) as [number, number],
        nice: true,
      }),
    [points]
  )
  const origZScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: extent(points.map(zAccessor)) as [number, number],
        nice: true,
      }),
    [points]
  )

  // bounds
  const xMax = useMemo(
    () => width - margin.left - margin.right,
    [width, margin]
  )
  const yMax = useMemo(
    () => height - margin.top - margin.bottom,
    [height, margin]
  )
  const zMax = useMemo(
    () => height - margin.top - margin.bottom,
    [height, margin]
  )

  const xScale = useMemo(
    () => origXScale.copy().range([0, xMax]),
    [xMax, origXScale]
  )
  const yScale = useMemo(
    () => origYScale.copy().range([yMax, 0]),
    [yMax, origYScale]
  )
  const zScale = useMemo(
    () => origZScale.copy().range([zMax, 0]),
    [zMax, origZScale]
  )

  const allNodes = useMemo(() => {
    return unzip(
      points.map((point, i) => {
        const pointNode: PointNode = {
          type: 'point',
          x: xScale(xAccessor(point)),
          y: yScale(yAccessor(point)),
          data: point,
          fx: xScale(xAccessor(point)),
          fy: yScale(yAccessor(point)),
        }
        const annotationNode: AnnotationNode = {
          type: 'annotation',
          x: xScale(xAccessor(point)),
          y: yScale(yAccessor(point)),
          data: `Point ${i}`,
        } as AnnotationNode
        const link: SimulationLinkDatum<MySimulationNode> = {
          source: pointNode,
          target: annotationNode,
          index: i,
        }
        return [pointNode, annotationNode, link]
      })
    ) as [PointNode[], AnnotationNode[], SimulationLink[]]
  }, [xScale, yScale, points])
  const [pointNodes, annotationNodes, links] = allNodes

  const simulation = useMemo(
    () =>
      forceSimulation<MySimulationNode>([...pointNodes, ...annotationNodes])
        .force(
          'connector',
          forceLink<MySimulationNode, SimulationLink>(links).distance(50)
        )
        .force(
          'repulsion',
          forceManyBody<MySimulationNode>().strength((d) =>
            d.type === 'annotation' ? -30 : 0
          )
        )
        .force(
          'prevent-overlap',
          forceCollide<MySimulationNode>().radius((d) => {
            if (d.type === 'annotation') return d.data.length * 4
            return 4
          })
        )
        .force('boundary', forceBoundary<MySimulationNode>(0, 0, xMax, yMax))
        .stop(),
    [pointNodes, annotationNodes, links, xMax, yMax]
  )

  const positionedAllNodes = useMemo(() => {
    // run simulation until end
    const ticksToStable = Math.ceil(
      Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
    )
    // NOTE: try not to rely on many simulation ticks too costly...
    simulation.tick(2)
    return [pointNodes, annotationNodes, links] as const
  }, [simulation, links, annotationNodes, pointNodes])

  const positionedAnnotationNodes = positionedAllNodes[1]

  // run the force simulation

  // annotation nodes are now positioned
  const renderedPoints = useMemo(
    () =>
      points.map((point, i) => {
        const transition = {
          ...motionTransition,
          delay: delay * i,
        }
        const x = xScale(xAccessor(point)) ?? 0
        const y = yScale(yAccessor(point)) ?? 0
        return (
          <motion.g
            key={`bubble-${i}`}
            data-index={i}
            initial={{ opacity: 0, x, y }}
            animate={{ opacity: 1, x, y }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <Shape
              shape={symbolScale(i)}
              size={shapeSize}
              fill="rgba(54, 151, 255, 0.5)"
            />
          </motion.g>
        )
      }),
    [points, symbolScale, xScale, yScale, shapeSize]
  )

  const renderedAnnotationNodes = useMemo(
    () =>
      positionedAnnotationNodes.map((annotationNode, i) => {
        const transition = {
          ...motionTransition,
          delay: delay * i,
        }
        const x = !isNil(annotationNode.x) ? annotationNode.x : 0
        const y = !isNil(annotationNode.y) ? annotationNode.y : 0
        return (
          <motion.g
            key={`annotation-bubble-${annotationNode.data}`}
            initial={{ opacity: 0, x, y }}
            animate={{ x, y, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <Shape
              shape={symbolScale(i)}
              size={annotationNode.data.length || 0}
            />
          </motion.g>
        )
      }),
    [symbolScale, positionedAnnotationNodes]
  )

  const renderedAnnotationText = useMemo(
    () =>
      positionedAnnotationNodes.map((annotationNode, i) => {
        const transition = {
          ...motionTransition,
          delay: delay * i,
        }
        return (
          <motion.text
            key={`annotation-text-${annotationNode.data}`}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            animate={{
              x: !isNil(annotationNode.x) ? annotationNode.x : 0,
              y: !isNil(annotationNode.y) ? annotationNode.y : 0,
              opacity: 1,
            }}
            textAnchor="middle"
            dominantBaseline={'middle'}
            transition={transition}
          >
            {annotationNode.data}
          </motion.text>
        )
      }),
    [positionedAnnotationNodes]
  )

  const renderedLinks = useMemo(
    () =>
      links.map((link, i) => {
        const transition = {
          ...motionTransition,
          delay: delay * i,
        }
        return (
          <motion.line
            key={i}
            stroke="black"
            initial={{
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 0,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            animate={{
              x1: (link.source as MySimulationNode).x ?? 0,
              y1: (link.source as MySimulationNode).y ?? 0,
              x2: (link.target as MySimulationNode).x ?? 0,
              y2: (link.target as MySimulationNode).y ?? 0,
              opacity: 1,
            }}
            transition={transition}
          />
        )
      }),
    [links]
  )

  // gonna need this in the future
  const entityCount = useMemo(
    () =>
      renderedAnnotationNodes.length +
      renderedPoints.length +
      renderedLinks.length,
    [
      renderedAnnotationNodes.length,
      renderedPoints.length,
      renderedLinks.length,
    ]
  )

  if (width < 10) return null
  return (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={'transparent'}
        rx={14}
      />
      <Group left={margin.left} top={margin.top}>
        <AnimatedGridColumns
          scale={xScale}
          height={yMax}
          stroke="#e0e0e0"
          animationTrajectory="center"
        />
        <AnimatedGridRows
          scale={yScale}
          width={xMax}
          stroke="#e0e0e0"
          animationTrajectory="center"
        />
        <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
        <AnimatedAxis
          orientation={Orientation.bottom}
          top={yMax}
          left={0}
          scale={xScale}
          numTicks={15}
          animationTrajectory="center"
        />
        <AnimatedAxis
          orientation={Orientation.left}
          top={0}
          left={0}
          numTicks={15}
          scale={yScale}
          tickLabelProps={{ textAnchor: 'end', y: '0.25em', x: '-0.25em' }}
          animationTrajectory="center"
        />
        <AnimatedAxis
          orientation={Orientation.right}
          top={0}
          left={xMax}
          scale={zScale}
          tickLabelProps={{ textAnchor: 'start', y: '0.25em', x: '0.25em' }}
          animationTrajectory="center"
        />
        <text x={0} y={15} transform="rotate(-90)" fontSize={10}>
          Y
        </text>
        <AnimatePresence>
          {renderedPoints}
          {showLinks ? renderedLinks : null}
          {showAnnotations ? renderedAnnotationNodes : null}
          {showAnnotations ? renderedAnnotationText : null}
        </AnimatePresence>
      </Group>
    </svg>
  )
}
