/* eslint-disable no-empty */
import { Group } from "@visx/group";
// import { Threshold } from "@visx/threshold";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom, AxisRight } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Circle } from "@visx/shape";

import { randomInt, randomLcg } from "d3-random";
import genPoints, { PointsRange } from "@visx/mock-data/lib/generators/genRandomNormalPoints";
import { motion } from "framer-motion";
import { extent } from "d3-array";
import { forceSimulation, forceCollide, forceLink, SimulationNodeDatum, SimulationLinkDatum, forceManyBody } from 'd3-force'
import forceBoundary from "./forceBoundary";
import { unzip } from "lodash-es";
import { useMemo } from "react";

const seed = 0.4487157388828242;
const genRandomPoints = (count: number, min: number, max: number) => {
  const generator = randomInt.source(randomLcg(seed))(min, max);
  return Array(count)
    .fill(undefined)
    .map(() => [generator(), generator(), generator()] as PointsRange);
};
const points = genRandomPoints(100, 0, 100);

export const background = "transparent";

// accessors

const xAccessor = (d: PointsRange) => d[0];
const yAccessor = (d: PointsRange) => d[1];
const zAccessor = (d: PointsRange) => d[2];

// scales

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

const defaultMargin = { top: 40, right: 50, bottom: 50, left: 40 };

export type ThresholdProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
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
}: ThresholdProps) {
  
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const zMax = height - margin.top - margin.bottom;
  
  const xScale = useMemo(() => origXScale.copy().range([0, xMax]), [xMax]);
  const yScale = useMemo(() => origYScale.copy().range([yMax, 0]), [yMax]);
  const zScale = useMemo(() => origZScale.copy().range([zMax, 0]), [zMax]);

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
  })) as [PointNode[], AnnotationNode[], SimulationLink[]], [xScale, yScale]);
  
  useMemo(() => {
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
  }, [pointNodes, annotationNodes, links])
    
  // run the force simulation
  
  // annotation nodes are now positioned

  if (width < 10) return null;
  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        // style={}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={background}
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
          {links.map((link, i) => <line key={i} stroke="black"
            x1={(link.source as MySimulationNode).x ?? 0} y1={(link.source as MySimulationNode).y ?? 0}
            x2={(link.target as MySimulationNode).x ?? 0} y2={(link.target as MySimulationNode).y ?? 0} />
            )}
          {points.map((point, i) => <motion.circle key={i} data-index={i} cx={xScale(xAccessor(point))} cy={yScale(yAccessor(point))} r={4} fill="rgba(54, 151, 255, 0.5)"/>)}
          {annotationNodes.map(annotationNode => <motion.circle key={annotationNode.data} cx={annotationNode.x ?? 0} cy={annotationNode.y ?? 0} r={annotationNode.data.length * 4} fill="rgba(255, 54, 54, 0.5)">{annotationNode.data}</motion.circle>)}          
          {annotationNodes.map(annotationNode => <motion.text key={annotationNode.data} x={annotationNode.x ?? 0} y={annotationNode.y ?? 0} textAnchor="middle" dominantBaseline="middle">{annotationNode.data}</motion.text>)}
        </Group>
      </svg>
    </div>
  );
}
