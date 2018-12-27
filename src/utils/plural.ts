import { cond, lte, always, curryN, T, pipe, last, head } from 'ramda'
import * as equals from 'ramda/src/equals';
import * as and from 'ramda/src/and';
import { UnitsFull } from '../types/enums';
import {argsToList} from './general';
const lessOrEqualTwo = pipe(
  argsToList,
  n => last<number>(n),
  lte(2)
)

export const addPluralForm = curryN(2, cond([
  [lessOrEqualTwo, pipe(
    head,
    v => always(`${v}s`)
  )],
  [lte(2), pipe(
    head,
    v => always(`${v}s`)
  )],
  [T, v => always(v)]
]))
// export const addPluralForm = curryN(2, (metric: string, val: number) => pluralForm(metric)(val))
