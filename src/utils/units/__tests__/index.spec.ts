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
  
  // it('plural to mertric', () => {
  //   expect(addPluralToMetric(1, UnitsFull.CENTIMETER)).toEqual([1, UnitsFull.CENTIMETER])
  //   expect(addPluralToMetric(1, UnitsFull.METER)).toEqual([1, UnitsFull.METER])
  //   expect(addPluralToMetric(1, UnitsFull.KILOMETR)).toEqual([1, UnitsFull.KILOMETR])
  //   expect(addPluralToMetric(1, UnitsFull.INCH)).toEqual([1, UnitsFull.INCH])
  //   expect(addPluralToMetric(1, UnitsFull.YARD)).toEqual([1, UnitsFull.YARD])
  //   expect(addPluralToMetric(1, UnitsFull.FOOT)).toEqual([1, UnitsFull.FOOT])
  //   expect(addPluralToMetric(1, UnitsFull.MILE)).toEqual([1, UnitsFull.MILE])
  //   expect(addPluralToMetric(2, UnitsFull.CENTIMETER)).toEqual([2, `${UnitsFull.CENTIMETER}s`])
  //   expect(addPluralToMetric(2, UnitsFull.METER)).toEqual([2, `${UnitsFull.METER}s`])
  //   expect(addPluralToMetric(2, UnitsFull.KILOMETR)).toEqual([2, `${UnitsFull.KILOMETR}s`])
  //   expect(addPluralToMetric(2, UnitsFull.INCH)).toEqual([2, `${UnitsFull.INCH}s`])
  //   expect(addPluralToMetric(2, UnitsFull.YARD)).toEqual([2, `${UnitsFull.YARD}s`])
  //   expect(addPluralToMetric(2, UnitsFull.FOOT)).toEqual([2, UnitsFull.FEET])
  //   expect(addPluralToMetric(2, UnitsFull.MILE)).toEqual([2, `${UnitsFull.MILE}s`])
  // })
})