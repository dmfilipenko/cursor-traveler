import { UnitsFull } from '../../types/enums';
import { convertMetrics } from '../converter';

describe('converterMetrics', () => {
  it('should display cm when value less then 100', () => {
    const num = 99
    const metric = convertMetrics(num)
    expect(metric).toBe(`${num}.00 ${UnitsFull.CENTIMETER}`)
  })
  it('should display cm when value more then 100 but less then 1000', () => {
    const num = 901
    const metric = convertMetrics(num)
    expect(metric).toBe(`${num/100} ${UnitsFull.METER}`)
  })
})