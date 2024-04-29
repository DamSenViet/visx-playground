declare module 'flubber' {
  export const interpolate: (
    a: string,
    b: string,
    options?: { maxSegmentLength: number }
  ) => (t: number) => string
}
