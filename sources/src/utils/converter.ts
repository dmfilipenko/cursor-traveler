import * as always from 'ramda/src/always';
import * as cond from 'ramda/src/cond';
import * as curry from 'ramda/src/curry';
import * as lte from 'ramda/src/lte';
import * as multiply from 'ramda/src/multiply';
import * as pipe from 'ramda/src/pipe';
import * as T from 'ramda/src/T';
import * as flip from 'ramda/src/flip';

import { UnitsFull, UnitsShort } from '../types/enums';
import { addPluralForm } from './plural'
export const pxToCm = multiply(0.02645833)


const cmToM = multiply(0.01)
const mToKm = multiply(0.001)
const cmToKm = pipe(cmToM, mToKm)

const addMetric = curry((metric, v) => [v, metric])
const fixed = curry((n, v) => v.toFixed(n))
const addPluralToMetric = ([v, metric]) => [v, addPluralForm(v, metric)]
const unitRounding = (round = always, tranform = always) => pipe(
  tranform,
  round,
  parseFloat
)
const metricAndValue = (metric) => pipe(
  addMetric(metric),
  addPluralToMetric
)
const roundKm = unitRounding(fixed(3), cmToKm)
const roundM = unitRounding(fixed(2), cmToM)
const roundCm = unitRounding(fixed(2), cmToM)
const roundAndMetric = (round, metric) => pipe(
  round, 
  metricAndValue(metric)
)
export const convertMetrics = cond([
  [lte(10 ** 5), roundAndMetric(roundKm, UnitsFull.KILOMETR)],
  [lte(10 ** 2), roundAndMetric(roundM, UnitsFull.METER)],
  [T, roundAndMetric(roundCm, UnitsFull.CENTIMETER)]
])
export const getUnits = cond([
  [lte(10 ** 5), always(UnitsShort.KILOMETR)],
  [lte(10 ** 2), always(UnitsShort.METER)],
  [T, always(UnitsShort.CENTIMETER)],
])
