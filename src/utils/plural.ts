import { cond, equals, always, lte, converge, and, curryN, T, pipe, last, identity, head, concat, __, flip } from 'ramda'
import { UnitsFull } from '../types/enums';
import {argsToList} from './general';
// const lessOrEqualTwo = pipe(
//   argsToList,
//   n => last<number>(n),
//   lte(2)
// )
const checkSecondArgLteTwo = pipe(
  n => last<number>(n),
  lte(2)
)

// const 

const addS = v => concat(v, 's')
const feetEdgeCase = converge(
  and,
  [
    checkSecondArgLteTwo,
    equals(UnitsFull.FOOT)
  ]
)
export const addPluralForm = curryN(2, cond([
  [feetEdgeCase, always(UnitsFull.FEET)],
  // [lessOrEqualTwo, addS],
  [T, flip(identity)]
]))

// export const addPluralForm = curryN(2, (metric: string, val: number) => pluralForm(metric)(val))
