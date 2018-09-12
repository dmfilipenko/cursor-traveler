import { curry } from 'ramda';

const CENTIMETER = 'cm'
const METER = 'm'
const KILOMETR = 'km'
const INCH = 'in'
const FOOT = 'ft'
const yard = 'yd'
const MILE = 'ml'

const cmToM = (cm: number) => 0.01 * cm
const mToKm = (m: number) => 0.001 * m

const isMoreThanNumber = (num, value: number): boolean => value / num > 0
const curryMoreThan = curry(isMoreThanNumber)
const isMoreThanTen = curryMoreThan(10)
const isMoreThanHundred = curryMoreThan(10 ** 2)
const isMoreThenThousand = curryMoreThan(10 ** 3)
const isMoreThenTenThousand = curryMoreThan(10 ** 4)
const isMoreThenHundredThousand = curryMoreThan(10 ** 5)
const isMoreThenMillion = curryMoreThan(10 ** 6)
const isMoreThenMilliard = curryMoreThan(10 ** 9)

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