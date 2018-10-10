import * as always from 'ramda/src/always';
import * as cond from 'ramda/src/cond';
import * as lte from 'ramda/src/lte';
import * as pipe from 'ramda/src/pipe';
import * as T from 'ramda/src/T';

import { Units } from '../types/enums';

const cmToM = (cm: number) => 0.01 * cm
const mToKm = (m: number) => 0.001 * m

const addMetric = (metric) => (v) => [v, metric]
const fixed = n => v => v.toFixed(n)
export const convertMetrics = cond([
  [lte(10 ** 5), pipe(cmToM, mToKm, fixed(3), addMetric(Units.KILOMETR))],
  [lte(10 ** 2), pipe(cmToM, fixed(2), addMetric(Units.METER))],
  [T, pipe(fixed(2), addMetric(Units.CENTIMETER))]
])
export const getUnits = cond([
  [lte(10 ** 5), always(Units.KILOMETR)],
  [lte(10 ** 2), always(Units.METER)],
  [T, always(Units.CENTIMETER)],
])
