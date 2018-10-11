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

const addMetric = curry((metric, v) => [v, metric])
const fixed = curry((n, v) => v.toFixed(n))
const addPluralToMetric = ([v, metric]) => {
  debugger
  return [v, addPluralForm(v, metric)]
}
export const convertMetrics = cond([
  [
    lte(10 ** 5), 
    pipe(
      cmToM, 
      mToKm, 
      fixed(3),
      pipe(
        addMetric(UnitsFull.KILOMETR),
        addPluralToMetric
      )
    )
  ],
  [
    lte(10 ** 2), 
    pipe(
      cmToM, 
      fixed(2), 
      parseFloat,
      pipe(
        addMetric(UnitsFull.METER),
        addPluralToMetric
      )
    )
    ],
  [
    T, 
    pipe(
      fixed(2), 
      parseFloat,
      pipe(
        addMetric(UnitsFull.CENTIMETER),
        addPluralToMetric
      )
    )
  ]
])
export const getUnits = cond([
  [lte(10 ** 5), always(UnitsShort.KILOMETR)],
  [lte(10 ** 2), always(UnitsShort.METER)],
  [T, always(UnitsShort.CENTIMETER)],
])
