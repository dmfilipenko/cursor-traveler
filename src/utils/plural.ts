import { cond, equals, always, lte, converge, and, curryN, T, pipe, last, identity, head, concat, __ } from 'ramda'
import { UnitsFull } from '../types/enums';
import {argsToList} from './general';
const lessOrEqualTwo = pipe(
  argsToList,
  n => last<number>(n),
  lte(2)
)
const addS = pipe(argsToList, head, v => concat(v, 's'))
const feetEdgeCase = converge(
  and,
  [
    lessOrEqualTwo,
    equals(UnitsFull.FOOT)
  ]
)
export const addPluralForm = curryN(2, cond([
  [feetEdgeCase, always(UnitsFull.FEET)],
  [lessOrEqualTwo, addS],
  [T, identity]
]))

// export const addPluralForm = curryN(2, (metric: string, val: number) => pluralForm(metric)(val))
