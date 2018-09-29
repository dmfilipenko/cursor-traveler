import { convertMetrics } from '../converter';
import {Units} from '../../types/enums';

describe('converterMetrics', () => {
  it('should display cm when value less then 100', () => {
    const num = 99
    const metric = convertMetrics(num)
    expect(metric).toBe(`${num}.00 ${Units.CENTIMETER}`)
  })
  it('should display cm when value more then 100 but less then 1000', () => {
    const num = 901
    const metric = convertMetrics(num)
    expect(metric).toBe(`${num/100} ${Units.METER}`)
  })
})