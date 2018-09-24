import pipe from 'ramda/es/pipe';
import sum from 'ramda/es/sum';
import values from 'ramda/es/values';

export const calculateTotal = pipe(
    values,
    sum,
)

export const totalToBadge = total => {
    const [f,s = '',t = '', ff = ''] = `${total}`
    return `${f}${s}${t}${ff}`
}
