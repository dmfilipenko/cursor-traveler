import { Effect, Context, Layer } from 'effect'

export interface DateService {
  readonly getDayStartTimestamp: (date?: Date) => Effect.Effect<number, never>
}

export const DateService = Context.GenericTag<DateService>("@services/DateService")



const getDayStartTimestamp = (date?: Date): Effect.Effect<number, never> =>
  Effect.sync(() => {
    const now = date || new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    const dayStart = new Date(year, month, day, 0, 0, 0, 0)
    return dayStart.getTime()
  })

export const DateServiceLive = Layer.succeed(
  DateService,
  DateService.of({
    getDayStartTimestamp
  })
) 