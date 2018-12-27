import { metricValueToList, toFixedCurr } from '../index'
describe('converterMetrics', () => {
  it('currying of Metric', () => {
    expect(metricValueToList(100)('asd')).toEqual(['asd', 100])
    expect(metricValueToList(100, 'asd')).toEqual(['asd', 100])
  })
  it('to Fixed curr ', () => {
    expect(toFixedCurr(2)(100.1000001)).toBe("100.10")
    expect(toFixedCurr(2, 100.1000001)).toBe("100.10")
  })
  
})