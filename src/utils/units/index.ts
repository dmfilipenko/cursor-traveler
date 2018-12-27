import * as multiply from 'ramda/src/multiply';
import * as curry from 'ramda/src/curry';

export const pxToCm = multiply(0.02645833)


export const metricValueToList = curry((metric, v) => [v, metric])
export const toFixedCurr = curry((num, val) => val.toFixed(num))
// const addPluralToMetric = ([v, metric]) => [v, addPluralForm(v, metric)]
// const unitRounding = (round = always, tranform = always) => pipe(
//   tranform,
//   round,
//   parseFloat
// )
// const metricAndValue = (metric) => pipe(
//   addMetric(metric),
//   addPluralToMetric
// )
// const roundKm = unitRounding(fixed(3), cmToKm)
// const roundM = unitRounding(fixed(2), cmToM)
// const roundCm = unitRounding(fixed(2), cmToM)
// const roundAndMetric = (round, metric) => pipe(
//   round, 
//   metricAndValue(metric)
// )
// export const convertMetrics = cond([
//   [lte(10 ** 5), roundAndMetric(roundKm, UnitsFull.KILOMETR)],
//   [lte(10 ** 2), roundAndMetric(roundM, UnitsFull.METER)],
//   [T, roundAndMetric(roundCm, UnitsFull.CENTIMETER)]
// ])
// export const getMetricUnits = cond([
//   [lte(10 ** 5), always(UnitsShort.KILOMETR)],
//   [lte(10 ** 2), always(UnitsShort.METER)],
//   [T, always(UnitsShort.CENTIMETER)],
// ])
