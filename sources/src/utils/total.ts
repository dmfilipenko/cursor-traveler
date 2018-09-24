import { pipe, sum, values } from 'ramda';

export const calculateTotal = pipe(
    values,
    sum,
)

export const totalToBadge = total => {
    const [f,s = '',t = '', ff = ''] = `${total}`
    return `${f}${s}${t}${ff}`
}
