import { multiply, curry, identity, unapply, curryN, invoker, pipe, juxt, flip } from 'ramda';
import { addPluralForm } from '../plural';
import {UnitsFull} from '../../types/enums';
import {argsToList} from '../general';
// import  from 'ramda/es/juxt';

export const pxToCm = multiply(0.02645833)
export const reverse = invoker(0, 'reverse')

export const metricValueToList = curryN(2,
  pipe(
    argsToList,
    reverse
  )
)
export const toFixedCurr = curry((num: number, val: number) => val.toFixed(num))
export const addPluralToMetric = curry(
  juxt([
    identity, 
    addPluralForm
  ])
)




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
