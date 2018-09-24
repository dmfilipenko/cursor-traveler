import { curry, cond, equals, gt, always, pipe, T, gte, lte } from 'ramda';
import { Units } from '../types/enums'

const cmToM = (cm: number) => 0.01 * cm
const mToKm = (m: number) => 0.001 * m

const addMetric = (metric) => (v) => `${v} ${metric}`
const fixed = (v) => v.toFixed(2)
export const converter = cond([
  // [lte(10 ** 9), always('Tooo huge')],
  // [lte(10 ** 6), always('Not too huge')],
  [lte(10 ** 5), pipe(cmToM, mToKm, fixed, addMetric(Units.KILOMETR))],
  [lte(10 ** 2), pipe(cmToM, fixed, addMetric(Units.METER))],
  [T, pipe(fixed, addMetric(Units.CENTIMETER))]
])
// const convertToMeter = (data) => {
//     if (cmToM(data.path) >= 1) {
//         return {
//             unit: METER,
//             path: cmToM(data.path)
//         }
//     }
//     return data
// }
// const convertToKilometr = (data) => {
//     if (mToKm(data.path) >= 1) {
//         return {
//             unit: KILOMETR,
//             path: mToKm(data.path)
//         }
//     }
//     return data
// }

// const converter = (value) => {
//     if (cmToM(value) >= 1) {
//         return {
//             path: cmToM(value),
//             unit: 'm'
//         }
//     }
//     if (mToKm(value) >= 1) {
//         return {
//             path: mToKm(value),
//             unit: 'km'
//         }
//     }
// }

// const convertToUnit = (unit: string, value: number) => {
//     if (unit === METER)
// }