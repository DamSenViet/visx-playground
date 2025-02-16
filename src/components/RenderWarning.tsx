import styled from 'styled-components'

interface SvgRenderWarningProps {
  width?: number
  height?: number
  x?: number
  y?: number
}

export default function SvgRenderWarning({
  width = 100,
  height = 100,
  x = 0,
  y = 0,
}: SvgRenderWarningProps) {
  return (
    <foreignObject x={0} y={0}>
      <div
        style={{
          width,
          height,
        }}
      >
        Too many objects
      </div>
    </foreignObject>
  )
}
