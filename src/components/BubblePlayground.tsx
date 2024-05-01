import { ParentSize } from '@visx/responsive'
import styled from 'styled-components'
import Chart from '../Chart'
import { scaleOrdinal } from 'd3-scale'
import {
  symbolCircle,
  symbolDiamond,
  symbolCross,
  symbolStar,
  symbolTriangle,
  symbolWye,
  symbolSquare,
} from 'd3-shape'
import { PointsRange } from '@visx/mock-data/lib/generators/genRandomNormalPoints'
import { Button, Slider } from 'antd'
import { useMemo, useState } from 'react'
import { randomInt, randomLcg } from 'd3-random'
import { useDebounce } from '@uidotdev/usehooks'
import { range, shuffle } from 'lodash-es'
import { MotionConfig } from 'framer-motion'

// const EnhancedChart = memo(Chart)
const MAX_POINTS_COUNT = 500

const ChartArea = styled(ParentSize)`
  align-self: stretch;
  justify-self: stretch;
  max-height: 100%;
  overflow: hidden;
`

const ControlsArea = styled.div`
  margin: auto 20px;
  color: 'black';
`

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  overflow: hidden;
  grid-template-columns: auto 1fr;
`

const BubblePlayground = () => {
  // real versions are debounced
  const [yMargin, setYMargin] = useState(40)
  const debouncedYMargin = useDebounce(yMargin, 300)
  const [xMargin, setXMargin] = useState(40)
  const debouncedXMargin = useDebounce(xMargin, 300)

  const genRandomPoints = (
    count: number,
    min: number,
    max: number,
    seed: number = 0.4487157388828242
  ) => {
    const generator = randomInt.source(randomLcg(seed))(min, max)
    return Array(count)
      .fill(undefined)
      .map(() => [generator(), generator(), generator()] as PointsRange)
  }

  const [pointsCount, setPointsCount] = useState(10)
  const debouncedPointsCount = useDebounce(pointsCount, 300)
  const [points, setPoints] = useState(
    genRandomPoints(MAX_POINTS_COUNT, 0, 100)
  )
  const filteredPoints = useMemo(
    () => points.slice(0, debouncedPointsCount),
    [points, debouncedPointsCount]
  )

  const [shapes, setShapes] = useState([
    symbolCircle,
    symbolDiamond,
    symbolCross,
    symbolStar,
    symbolTriangle,
    symbolSquare,
    symbolWye,
  ])
  const symbolScale = useMemo(
    () => scaleOrdinal(range(0, 10), shapes),
    [shapes]
  )

  const handleShuffleShapes = () => {
    setShapes(shuffle(shapes.slice()))
  }
  const handleRandomize = () => {
    setPoints(genRandomPoints(MAX_POINTS_COUNT, 0, 100, Math.random()))
  }

  const debouncedChartMargins = useMemo(
    () => ({
      top: debouncedYMargin,
      bottom: debouncedYMargin,
      left: debouncedXMargin,
      right: debouncedXMargin,
    }),
    [debouncedXMargin, debouncedYMargin]
  )

  return (
    <MotionConfig>
      <Container>
        <ControlsArea>
          <Button onClick={handleRandomize}>Randomize Points</Button>
          <br />
          <Button onClick={handleShuffleShapes}>Shuffle Shapes</Button>
          <div>
            Points #
            <Slider
              step={5}
              min={5}
              max={MAX_POINTS_COUNT}
              onChange={setPointsCount}
              value={pointsCount}
            />
          </div>
          <div>
            X Margin
            <Slider
              step={5}
              min={25}
              max={300}
              onChange={setXMargin}
              value={xMargin}
            />
          </div>
          <div>
            Y Margin
            <Slider
              step={5}
              min={25}
              max={300}
              onChange={setYMargin}
              value={yMargin}
            />
          </div>
        </ControlsArea>
        <ChartArea debounceTime={300}>
          {({ width, height }) => (
            <Chart
              width={width}
              height={height}
              margin={debouncedChartMargins}
              points={filteredPoints}
              symbolScale={symbolScale}
            />
          )}
        </ChartArea>
      </Container>
    </MotionConfig>
  )
}

export { BubblePlayground as Playground }
