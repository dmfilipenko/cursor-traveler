import { Effect, Context, Layer, Schema, Either, Option, Array } from 'effect'

export interface CalculationService {
  readonly calculateTotal: (data: Record<string, any>) => Effect.Effect<number, never>
  readonly filterValidValues: (data: Record<string, any>) => Effect.Effect<number[], never>
}

export const CalculationService = Context.GenericTag<CalculationService>("@services/CalculationService")

// Schema for positive numbers
const PositiveNumberSchema = Schema.Number.pipe(
  Schema.filter(n => n >= 0 && !isNaN(n))
)

// Schema for string that can be converted to positive number
const PositiveNumberFromStringSchema = Schema.NumberFromString.pipe(
  Schema.filter(n => n >= 0 && !isNaN(n))
)

const parseValue = (value: unknown): Option.Option<number> => {
  // Try as number first
  const numberResult = Schema.decodeUnknownEither(PositiveNumberSchema)(value)
  if (Either.isRight(numberResult)) {
    return Option.some(numberResult.right)
  }
  
  // Try as string that converts to number
  const stringResult = Schema.decodeUnknownEither(PositiveNumberFromStringSchema)(value)
  if (Either.isRight(stringResult)) {
    return Option.some(stringResult.right)
  }
  
  return Option.none()
}

const filterValidValues = (data: Record<string, any>): Effect.Effect<number[], never> =>
  Effect.sync(() => {
    const values = Object.values(data)
    return Array.filterMap(values, parseValue)
  })

const calculateTotal = (data: Record<string, any>): Effect.Effect<number, never> =>
  Effect.gen(function* () {
    console.log('🧮 Calculation: Input data:', data)
    
    const numericValues = yield* filterValidValues(data)
    console.log('🧮 Calculation: Valid numeric values:', numericValues)
    
    const total = Array.reduce(numericValues, 0, (sum, value) => sum + value)
    console.log('🧮 Calculation: Total:', total)
    
    return total
  })

export const CalculationServiceLive = Layer.succeed(
  CalculationService,
  CalculationService.of({
    calculateTotal,
    filterValidValues
  })
) 