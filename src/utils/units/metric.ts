import * as multiply from 'ramda/src/multiply';
import * as pipe from 'ramda/src/pipe';

export const cmToM = multiply(0.01)
export const mToKm = pipe(
  cmToM,
  multiply(0.1)
)
export const cmToKm = pipe(cmToM, mToKm)