import { metricValueToList, toFixedCurr, addPluralToMetric } from '../index'
import { UnitsFull } from '../../../types/enums';
describe('converterMetrics', () => {
  it('currying of Metric', () => {
    expect(metricValueToList(100)('asd')).toEqual(['asd', 100])
    expect(metricValueToList(100, 'asd')).toEqual(['asd', 100])
  })
  it('to Fixed curr ', () => {
    expect(toFixedCurr(2)(100.1000001)).toBe("100.10")
    expect(toFixedCurr(2, 100.1000001)).toBe("100.10")
  })
  
  it('plural to mertric', () => {
    expect(addPluralToMetric(UnitsFull.CENTIMETER, 1)).toEqual([1, `${UnitsFull.CENTIMETER}`])
    expect(addPluralToMetric(UnitsFull.CENTIMETER, 2)).toEqual([2, `${UnitsFull.CENTIMETER}s`])
  })
})