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
    expect(addPluralToMetric(UnitsFull.CENTIMETER, 1)).toEqual([1, UnitsFull.CENTIMETER])
    expect(addPluralToMetric(UnitsFull.METER, 1)).toEqual([1, UnitsFull.METER])
    expect(addPluralToMetric(UnitsFull.KILOMETR, 1)).toEqual([1, UnitsFull.KILOMETR])
    expect(addPluralToMetric(UnitsFull.INCH, 1)).toEqual([1, UnitsFull.INCH])
    expect(addPluralToMetric(UnitsFull.YARD, 1)).toEqual([1, UnitsFull.YARD])
    expect(addPluralToMetric(UnitsFull.FOOT, 1)).toEqual([1, UnitsFull.FOOT])
    expect(addPluralToMetric(UnitsFull.MILE, 1)).toEqual([1, UnitsFull.MILE])
    expect(addPluralToMetric(UnitsFull.CENTIMETER, 2)).toEqual([2, `${UnitsFull.CENTIMETER}s`])
    expect(addPluralToMetric(UnitsFull.METER, 2)).toEqual([2, `${UnitsFull.METER}s`])
    expect(addPluralToMetric(UnitsFull.KILOMETR, 2)).toEqual([2, `${UnitsFull.KILOMETR}s`])
    expect(addPluralToMetric(UnitsFull.INCH, 2)).toEqual([2, `${UnitsFull.INCH}s`])
    expect(addPluralToMetric(UnitsFull.YARD, 2)).toEqual([2, `${UnitsFull.YARD}s`])
    expect(addPluralToMetric(UnitsFull.FOOT, 2)).toEqual([2, UnitsFull.FEET])
    expect(addPluralToMetric(UnitsFull.MILE, 2)).toEqual([2, `${UnitsFull.MILE}s`])
  })
})