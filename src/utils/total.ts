import * as pipe from 'ramda/src/pipe';
import * as sum from 'ramda/src/sum';
import * as values from 'ramda/src/values';

export const calculateTotal = pipe(
    values,
    sum,
)