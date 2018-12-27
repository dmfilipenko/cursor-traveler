import {cmToKm, cmToM, mToKm} from '../metric'
describe('converterMetrics', () => {
  it('convert cm to m', () => {
    expect(cmToM(100)).toBe(1)
    expect(cmToM(1000)).toBe(10)
    expect(cmToM(10000)).toBe(100)
  })
  it('convert m to km', () => {
    expect(mToKm(100)).toBeCloseTo(0.1)
    expect(mToKm(1000)).toBeCloseTo(1)
    expect(mToKm(10000)).toBeCloseTo(10)
  })
  it('convert cm to km', () => {
    expect(cmToKm(1000)).toBeCloseTo(0.01)
    expect(cmToKm(10000)).toBeCloseTo(0.1)
    expect(cmToKm(100000)).toBeCloseTo(1)
  })
})