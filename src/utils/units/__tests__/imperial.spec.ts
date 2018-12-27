import { cmToInch, inchToFoot, footToYard, yardToMile } from '../imperial'
describe('converterMetrics', () => {
  it('convert cm to inch', () => {
    expect(cmToInch(1)).toBeCloseTo(0.39)
  })
  it('convert inch to foot', () => {
    expect(inchToFoot(1)).toBeCloseTo(0.08)
  })
  it('convert foot to yard', () => {
    expect(footToYard(1)).toBeCloseTo(0.33)
  })
  it('convert yard to mile', () => {
    expect(yardToMile(1)).toBeCloseTo(0.000568, 5)
  })
})