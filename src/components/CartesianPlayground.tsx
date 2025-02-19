import { CartesianLayout } from './CartesianLayout'
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
import styled from 'styled-components'

const MemoizedChart = memo(CartesianLayout)

const StyledControlsArea = styled(PlaygroundControlsArea)`
  min-width: 200px;
`

const CartesianLayoutPlayground = () => {
  // real versions are debounced
  const [bottomMargin, setBottomMargin] = useState(0)
  const [topMargin, setTopMargin] = useState(0)
  const [leftMargin, setLeftMargin] = useState(0)
  const [rightMargin, setRightMargin] = useState(0)

  const debouncedBottomMargin = useDebounce(bottomMargin, 300)
  const debouncedTopMargin = useDebounce(topMargin, 300)
  const debouncedLeftMargin = useDebounce(leftMargin, 300)
  const debouncedRightMargin = useDebounce(rightMargin, 300)
  const [animate, setAnimate] = useState(true)

  const handleAnimateChange = useCallback((event: CheckboxChangeEvent) => {
    setAnimate(event.target.checked)
  }, [])

  const debouncedChartMargins = useMemo(
    () => ({
      bottom: debouncedBottomMargin,
      top: debouncedTopMargin,
      left: debouncedLeftMargin,
      right: debouncedRightMargin,
    }),
    [
      debouncedBottomMargin,
      debouncedTopMargin,
      debouncedLeftMargin,
      debouncedRightMargin,
    ]
  )

  return (
    <MotionConfig>
      <PlaygroundContainer>
        <StyledControlsArea>
          <PlaygroundControlsGroup>
            Top Margin
            <Slider
              step={5}
              min={0}
              max={300}
              onChange={setTopMargin}
              value={topMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            Bottom Margin
            <Slider
              step={5}
              min={0}
              max={300}
              onChange={setBottomMargin}
              value={bottomMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            Left Margin
            <Slider
              step={5}
              min={0}
              max={300}
              onChange={setLeftMargin}
              value={leftMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            Right Margin
            <Slider
              step={5}
              min={0}
              max={300}
              onChange={setRightMargin}
              value={rightMargin}
            />
          </PlaygroundControlsGroup>
          <PlaygroundControlsGroup>
            <Checkbox checked={animate} onChange={handleAnimateChange} />
            Animate
          </PlaygroundControlsGroup>
        </StyledControlsArea>
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

export { CartesianLayoutPlayground }
