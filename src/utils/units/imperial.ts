import * as divide from 'ramda/src/divide';
import * as pipe from 'ramda/src/pipe';
import * as __ from 'ramda/src/__';

export const cmToInch = divide(__, 2.54)
export const inchToFoot = divide(__, 12)
export const footToYard = divide(__, 3)

export const yardToMile = divide(__, 1760)