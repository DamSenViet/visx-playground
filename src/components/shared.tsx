import styled from 'styled-components'
import { ParentSize } from '@visx/responsive'

export const PlaygroundContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  overflow: hidden;
  grid-template-columns: auto 1fr;
`

export const PlaygroundControlsArea = styled.div`
  border-right: 1px solid rgb(240, 240, 240);
  padding: 15px 35px;
  max-height: 100%;
  overflow: auto;
`

export const PlaygroundChartArea = styled(ParentSize)`
  align-self: stretch;
  justify-self: stretch;
  height: 100%;
  overflow: hidden;
`

export const PlaygroundControlsGroup = styled.div`
  margin: 10px 0px;
`
