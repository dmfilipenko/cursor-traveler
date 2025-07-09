import { sync, gen } from 'effect/Effect'
import type { Effect } from 'effect'
import { GenericTag } from 'effect/Context'
import { succeed } from 'effect/Layer'
import { Number as NumberSchema, NumberFromString, filter, decodeUnknownEither } from 'effect/Schema'
import { isRight } from 'effect/Either'
import { some, none } from 'effect/Option'
import type { Option } from 'effect/Option'
import { filterMap, reduce } from 'effect/Array'

export interface CalculationService {
  readonly calculateTotal: (data: Record<string, any>) => Effect.Effect<number, never>
  readonly filterValidValues: (data: Record<string, any>) => Effect.Effect<number[], never>
}

export const CalculationService = GenericTag<CalculationService>("@services/CalculationService")

// Schema for positive numbers
const PositiveNumberSchema = NumberSchema.pipe(
  filter((n: number) => n >= 0 && !isNaN(n))
)

// Schema for string that can be converted to positive number
const PositiveNumberFromStringSchema = NumberFromString.pipe(
  filter((n: number) => n >= 0 && !isNaN(n))
)

const parseValue = (value: unknown): Option<number> => {
  // Try as number first
  const numberResult = decodeUnknownEither(PositiveNumberSchema)(value)
  if (isRight(numberResult)) {
    return some(numberResult.right)
  }
  
  // Try as string that converts to number
  const stringResult = decodeUnknownEither(PositiveNumberFromStringSchema)(value)
  if (isRight(stringResult)) {
    return some(stringResult.right)
  }
  
  return none()
}

const filterValidValues = (data: Record<string, any>): Effect.Effect<number[], never> =>
  sync(() => {
    const values = Object.values(data)
    return filterMap(values, parseValue)
  })

const calculateTotal = (data: Record<string, any>): Effect.Effect<number, never> =>
  gen(function* () {
    
    const numericValues = yield* filterValidValues(data)
    const total = reduce(numericValues, 0, (sum: number, value: number) => sum + value)
    return total
  })

export const CalculationServiceLive = succeed(
  CalculationService,
  CalculationService.of({
    calculateTotal,
    filterValidValues
  })
) 