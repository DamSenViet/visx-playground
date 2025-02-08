import { ParentSize } from '@visx/responsive'
import styled from 'styled-components'
import BubbleChart from './BubbleChart'
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

const MemoizedChart = memo(BubbleChart)
const MAX_POINTS_COUNT = 1000

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

const BubblePlayground = () => {
  // real versions are debounced
  const [yMargin, setYMargin] = useState(40)
  const debouncedYMargin = useDebounce(yMargin, 300)
  const [xMargin, setXMargin] = useState(40)
  const debouncedXMargin = useDebounce(xMargin, 300)
  const [showLinks, setShowLinks] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [shapeSize, setShapeSize] = useState(10)
  const debouncedShapeSize = useDebounce(shapeSize, 300)

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
  const handleShowAnnotationsChange = useCallback(
    (event: CheckboxChangeEvent) => {
      setShowAnnotations(event.target.checked)
    },
    [setShowAnnotations]
  )
  const handleShowLinksChange = useCallback(
    (event: CheckboxChangeEvent) => {
      setShowLinks(event.target.checked)
    },
    [setShowLinks]
  )

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
            Shape Size
            <Slider
              step={5}
              min={10}
              max={100}
              onChange={setShapeSize}
              value={shapeSize}
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
          <div>
            <Checkbox
              checked={showAnnotations}
              onChange={handleShowAnnotationsChange}
            />
            Show Annotations
            <br />
            <Checkbox checked={showLinks} onChange={handleShowLinksChange} />
            Show Links
          </div>
        </ControlsArea>
        <ChartArea debounceTime={500}>
          {({ width, height }) => (
            <MemoizedChart
              width={width}
              height={height}
              margin={debouncedChartMargins}
              points={filteredPoints}
              symbolScale={symbolScale}
              showAnnotations={showAnnotations}
              showLinks={showLinks}
              shapeSize={debouncedShapeSize}
            />
          )}
        </ChartArea>
      </Container>
    </MotionConfig>
  )
}

export { BubblePlayground as Playground }
