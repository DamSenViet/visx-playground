import { motion } from "framer-motion";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom, AxisRight } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { PointsRange } from "@visx/mock-data/lib/generators/genRandomNormalPoints";
import { extent } from "d3-array";
import { forceSimulation, forceCollide, forceLink, SimulationNodeDatum, SimulationLinkDatum, forceManyBody } from 'd3-force'
import forceBoundary from "./forceBoundary";
import { unzip, isNil } from "lodash-es";
import { useMemo } from "react";

// accessors
const xAccessor = (d: PointsRange) => d[0];
const yAccessor = (d: PointsRange) => d[1];
const zAccessor = (d: PointsRange) => d[2];

const defaultMargin = { top: 40, right: 50, bottom: 50, left: 40 };

export type ChartProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  points: PointsRange[]
};


interface AnnotationNode extends SimulationNodeDatum {
  type: 'annotation',
  data: string
}

interface PointNode extends SimulationNodeDatum {
  type: 'point',
  data: PointsRange
}
type MySimulationNode = PointNode | AnnotationNode
type SimulationLink = SimulationLinkDatum<MySimulationNode>;

export default function Theshold({
  width,
  height,
  margin = defaultMargin,
  points,
}: ChartProps) {
  const origXScale = scaleLinear<number>({
    domain: extent(points.map(xAccessor)) as [number, number],
    nice: true,
  })
  const origYScale = scaleLinear<number>({
    domain: extent(points.map(yAccessor)) as [number, number],
    nice: true,
  })
  const origZScale = scaleLinear<number>({
    domain: extent(points.map(zAccessor)) as [number, number],
    nice: true,
  })
  
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const zMax = height - margin.top - margin.bottom;
  
  const xScale = useMemo(() => origXScale.copy().range([0, xMax]), [xMax, origXScale]);
  const yScale = useMemo(() => origYScale.copy().range([yMax, 0]), [yMax, origYScale]);
  const zScale = useMemo(() => origZScale.copy().range([zMax, 0]), [zMax, origZScale]);

  const [ pointNodes, annotationNodes, links ] = useMemo(() => unzip(points.map((point, i) => {
    const pointNode: PointNode = {
      type: 'point',
      x: xScale(xAccessor(point)),
      y: yScale(yAccessor(point)),
      data: point,
      fx: xScale(xAccessor(point)),
      fy: yScale(yAccessor(point)),
    };
    const annotationNode: AnnotationNode = {
      type: 'annotation',
      x: xScale(xAccessor(point)),
      y: yScale(yAccessor(point)),
      data: `Point ${i}`,
    } as AnnotationNode;
    const link: SimulationLinkDatum<MySimulationNode> = {
      source: pointNode,
      target: annotationNode,
      index: i,
    }
    return [
      pointNode,
      annotationNode,
      link
    ];
  })) as [PointNode[], AnnotationNode[], SimulationLink[]], [xScale, yScale, points]);
  
  const positionedAnnotationNode = useMemo(() => {
    const simulation = forceSimulation<MySimulationNode>([...pointNodes, ...annotationNodes]);
    simulation
      .force('connector', forceLink<MySimulationNode, SimulationLink>(links).distance(50))
      .force('repulsion', forceManyBody<MySimulationNode>().strength(d => d.type==='annotation' ? -30 : 0))
      .force('prevent-overlap', forceCollide<MySimulationNode>()
        .radius(d => {
          if (d.type === 'annotation')
            return d.data.length * 4;
          return 4;
        })
      )
      .force('boundary', forceBoundary<MySimulationNode>(0, 0, xMax, yMax));
    // run simulation until end
    const ticksToStable = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
    simulation.tick(ticksToStable);
    return annotationNodes
  }, [pointNodes, annotationNodes, links, xMax, yMax])
    
  // run the force simulation
  
  // annotation nodes are now positioned

  if (width < 10) return null;
  return (
      <svg
        width={width}
        height={height}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={"transparent"}
          rx={14}
        />
        <Group left={margin.left} top={margin.top}>
          <GridColumns
            scale={xScale}
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <GridRows
            scale={yScale}
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
          <AxisBottom top={yMax} left={0} scale={xScale} numTicks={12} />
          <AxisLeft top={0} left={0} scale={yScale} />
          <AxisRight top={0} left={xMax} scale={zScale} />
          <text x={0} y={15} transform="rotate(-90)" fontSize={10}>
            Y
          </text>
          {links.map((link, i) => <motion.line
            key={i}
            stroke="black"
            animate={{
              x1: (link.source as MySimulationNode).x ?? 0,
              y1: (link.source as MySimulationNode).y ?? 0,
              x2: (link.target as MySimulationNode).x ?? 0,
              y2: (link.target as MySimulationNode).y ?? 0,
            }}
            />)}
          {points.map((point, i) => <motion.circle
            key={i}
            data-index={i}
            animate={{
              cx: xScale(xAccessor(point)) ?? 0,
              cy: yScale(yAccessor(point)) ?? 0,
              r: 4, fill:"rgba(54, 151, 255, 0.5)" 
            }}
            />)}
          {positionedAnnotationNode.map(annotationNode => <motion.circle
            key={annotationNode.data}
            animate={{
              cx: !isNil(annotationNode.x) ? annotationNode.x : 0,
              cy: !isNil(annotationNode.y) ? annotationNode.y : 0,
              fill:"rgba(205, 36, 36, 0.5)",
            }}
            r={(annotationNode.data.length * 4) ?? 0}
            />)}     
          {positionedAnnotationNode.map(annotationNode => <motion.text
              key={annotationNode.data}
              animate={{
                x: !isNil(annotationNode.x) ? annotationNode.x : 0,
                y: !isNil(annotationNode.y) ? annotationNode.y : 0,
              }}
              textAnchor="middle"
              dominantBaseline={'middle'}
              >
                {annotationNode.data}
            </motion.text>)}
        </Group>
      </svg>
  );
}
