import { identity, unapply, pipe, head, concat } from 'ramda';

// export const argsToList = unapply(identity);
export const argsToList = (...args) => args;
