import * as cond from 'ramda/src/cond';
import * as lte from 'ramda/src/lte';
import * as always from 'ramda/src/always';
import * as T from 'ramda/src/T';


export const addPluralForm = (v, metric) => cond([
  [lte(2), always(`${metric}s`)],
  [T, always(metric)]
])(v)