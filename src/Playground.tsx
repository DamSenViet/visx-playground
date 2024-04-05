import { ParentSize } from '@visx/responsive'
import styled from 'styled-components'
import Chart from './Chart'

const StyledParentSize = styled(ParentSize)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled.div`
  height: 100%;
`

const Playground = () => {
  return (
    <Container>
      <StyledParentSize debounceTime={100}>
        {({ width, height }) => <Chart width={width} height={height} />}
      </StyledParentSize>
    </Container>
  )
}

export { Playground }
