import { CartesianChart } from './CartesianChart'
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
import { Button, Slider, Checkbox } from 'antd'
import { useMemo, useState, memo, useCallback } from 'react'
import { randomInt, randomLcg } from 'd3-random'
import { useDebounce } from '@uidotdev/usehooks'
import { range, shuffle } from 'lodash-es'
import { MotionConfig } from 'framer-motion'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import {
  PlaygroundContainer,
  PlaygroundChartArea,
  PlaygroundControlsArea,
  PlaygroundControlsGroup,
} from './shared'

const MemoizedChart = memo(CartesianChart)
const MAX_POINTS_COUNT = 1000

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

const CartesianPlayground = () => {
  // real versions are debounced
  const [yMargin, setYMargin] = useState(40)
  const debouncedYMargin = useDebounce(yMargin, 300)
  const [xMargin, setXMargin] = useState(40)
  const debouncedXMargin = useDebounce(xMargin, 300)
  const [animate, setAnimate] = useState(true)

  const [pointsCount, setPointsCount] = useState(10)
  const debouncedPointsCount = useDebounce(pointsCount, 300)
  const [points, setPoints] = useState(
    genRandomPoints(MAX_POINTS_COUNT, 0, 100)
  )
  const debouncedPoints = useDebounce(points, 300)

  const filteredPoints = useMemo(
    () => debouncedPoints.slice(0, debouncedPointsCount),
    [debouncedPoints, debouncedPointsCount]
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

  const handleShuffleShapes = useCallback(() => {
    setShapes(shuffle(shapes.slice()))
  }, [setShapes, shapes])
  const handleRandomize = useCallback(() => {
    setPoints(genRandomPoints(MAX_POINTS_COUNT, 0, 100, Math.random()))
  }, [setPoints])
  const handleAnimateChange = useCallback((event: CheckboxChangeEvent) => {
    setAnimate(event.target.checked)
  }, [])

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
      <PlaygroundContainer>
        <PlaygroundControlsArea>
          <PlaygroundControlsGroup>
            <Button onClick={handleRandomize}>Randomize Points</Button>
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            <Button onClick={handleShuffleShapes}>Shuffle Shapes</Button>
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            Points #
            <Slider
              step={5}
              min={5}
              max={MAX_POINTS_COUNT}
              onChange={setPointsCount}
              value={pointsCount}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            X Margin
            <Slider
              step={5}
              min={25}
              max={300}
              onChange={setXMargin}
              value={xMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            Y Margin
            <Slider
              step={5}
              min={25}
              max={300}
              onChange={setYMargin}
              value={yMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            <Checkbox checked={animate} onChange={handleAnimateChange} />
            Animate
          </PlaygroundControlsGroup>
        </PlaygroundControlsArea>
        <PlaygroundChartArea debounceTime={500}>
          {({ width, height }) => (
            <MemoizedChart
              width={width}
              height={height}
              margin={debouncedChartMargins}
              animate={animate}
            />
          )}
        </PlaygroundChartArea>
      </PlaygroundContainer>
    </MotionConfig>
  )
}

export { CartesianPlayground }
