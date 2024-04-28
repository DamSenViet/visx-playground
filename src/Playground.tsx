import { ParentSize } from '@visx/responsive'
import styled from 'styled-components'
import Chart from './Chart'
import { scaleOrdinal } from "d3-scale";
import { symbolCircle, symbolDiamond, symbolCross, symbolStar, symbolTriangle, symbolWye } from "d3-shape";
import { PointsRange } from "@visx/mock-data/lib/generators/genRandomNormalPoints";
import { Button, Slider } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import { randomInt, randomLcg } from "d3-random";
import { debounce } from 'lodash-es';


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
  grid-template-columns: 150px 1fr;
`

const Playground = () => {
  const [yMargin, setYMargin] = useState(40);
  const [xMargin, setXMargin] = useState(40);
  
  const genRandomPoints = (count: number, min: number, max: number, seed: number = 0.4487157388828242) => {
    const generator = randomInt.source(randomLcg(seed))(min, max);
    return Array(count)
      .fill(undefined)
      .map(() => [generator(), generator(), generator()] as PointsRange);
  };
  
  const [pointSlide, setPointsSlide] = useState(10)
  const [pointsCount, setPointsCount] = useState(10);
  const [points, setPoints] = useState(genRandomPoints(200, 0, 100));
  const filteredPoints = useMemo(() => points.slice(0, pointsCount), [points, pointsCount])
  
  const debouncedSetPointsCount = useCallback(debounce(setPointsCount, 150), [setPointsCount]);
  
  useEffect(() => { debouncedSetPointsCount(pointSlide) }, [pointSlide, debouncedSetPointsCount])
  
  const handleRandomize = () => {
    setPoints(genRandomPoints(200, 0, 100, Math.random()));
  }
  
  return (
      <Container>
        <ControlsArea>
          <Button onClick={handleRandomize}>Randomize</Button>
          <div>
            Points #
            <Slider step={5} min={0} max={200} onChange={setPointsSlide} value={pointSlide} />
          </div>
          <div>
            X Margin
            <Slider step={5} min={25} max={300} onChange={setXMargin} value={xMargin} />
          </div>
          <div>
            Y Margin
            <Slider step={5} min={25} max={300} onChange={setYMargin} value={yMargin} />
          </div>
        </ControlsArea>
        <ChartArea debounceTime={150}>
          {({ width, height }) => <Chart width={width} height={height} margin={{ top: yMargin, bottom: yMargin, left: xMargin, right: xMargin }} points={filteredPoints}/>}
        </ChartArea>
      </Container>      
  )
}

export { Playground }
