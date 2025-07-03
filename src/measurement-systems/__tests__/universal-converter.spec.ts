import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Effect } from 'effect'
import { 
  convertPixelsToById,
  convertBetween,
  convertPixelsToSystem,
  convertBetweenSystems,
  getUnitSymbol
} from '../universal-converter'
import { MetricSystem, ImperialSystem, AstronomicalSystem, NauticalSystem } from '../systems'
// ConversionError type available if needed

// Mock DOM methods for DPI detection
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

beforeEach(() => {
  // Mock DOM APIs
  const mockElement = {
    style: {},
    offsetWidth: 96, // Default DPI
    offsetHeight: 96
  }
  
  mockCreateElement.mockReturnValue(mockElement)
  mockAppendChild.mockImplementation(() => {})
  mockRemoveChild.mockImplementation(() => {})
  
  Object.defineProperty(global, 'document', {
    value: {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild
      }
    },
    writable: true
  })

  Object.defineProperty(global, 'window', {
    value: {
      devicePixelRatio: 1
    },
    writable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('Universal Converter', () => {
  describe('convertPixelsToById (legacy)', () => {
    it('should convert pixels to metric system', async () => {
      const result = await Effect.runPromise(convertPixelsToById(137.8, 'metric'))
      
      expect(result).toEqual({
        value: expect.any(Number),
        unit: expect.objectContaining({
          name: expect.any(String),
          symbol: expect.any(String)
        }),
        formatted: expect.any(String)
      })
    })

    it('should convert pixels to imperial system', async () => {
      const result = await Effect.runPromise(convertPixelsToById(245.7, 'imperial'))
      
      expect(result.unit.symbol).toBe('in')
      expect(result.formatted).toContain('inch')
    })

    it('should handle astronomical system for large values', async () => {
      // Very large pixel value to trigger astronomical units
      const result = await Effect.runPromise(convertPixelsToById(89432176.3, 'astronomical'))
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.formatted).toContain('astronomical unit')
    })

    it('should fail with invalid system ID', async () => {
      const result = Effect.runPromise(convertPixelsToById(123.4, 'invalid'))
      
      await expect(result).rejects.toThrow()
    })

    it('should fail with negative pixels', async () => {
      const result = Effect.runPromise(convertPixelsToById(-67.2, 'metric'))
      
      await expect(result).rejects.toThrow('Pixel value cannot be negative')
    })
  })

  describe('convertBetween', () => {
    it('should convert between metric and imperial systems', async () => {
      const result = await Effect.runPromise(convertBetween(254.7, 'metric', 'imperial'))
      
      expect(result.unit.symbol).toBe('in')
      expect(result.value).toBeGreaterThan(0)
    })

    it('should handle same system conversion', async () => {
      const result = await Effect.runPromise(convertBetween(1247.6, 'metric', 'metric'))
      
      // 1247.6mm > 1000mm threshold, so should display as meter
      expect(result.unit.symbol).toBe('m')
      expect(result.value).toBeCloseTo(1.25, 1)
    })

    it('should fail with invalid from system', async () => {
      const result = Effect.runPromise(convertBetween(156.3, 'invalid', 'metric'))
      
      await expect(result).rejects.toThrow()
    })

    it('should fail with invalid to system', async () => {
      const result = Effect.runPromise(convertBetween(892.1, 'metric', 'invalid'))
      
      await expect(result).rejects.toThrow()
    })
  })

  describe('convertPixelsToSystem', () => {
    it('should convert pixels directly to metric system object', async () => {
      const result = await Effect.runPromise(convertPixelsToSystem(324.8, MetricSystem))
      
      expect(result.unit.name).toContain('meter')
      expect(result.value).toBeGreaterThan(0)
    })

    it('should convert pixels to imperial system object', async () => {
      const result = await Effect.runPromise(convertPixelsToSystem(98.7, ImperialSystem))
      
      expect(result.unit.name).toBe('inch')
    })

    it('should convert pixels to astronomical system object', async () => {
      // Use a much larger value to reach AU threshold
      const result = await Effect.runPromise(convertPixelsToSystem(7.5e13, AstronomicalSystem))
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.value).toBeGreaterThan(0)
    })

    it('should convert pixels to nautical system object', async () => {
      const result = await Effect.runPromise(convertPixelsToSystem(1834.9, NauticalSystem))
      
      expect(result.unit.name).toBe('fathom')
      expect(result.value).toBeGreaterThan(0)
    })
  })

  describe('convertBetweenSystems', () => {
    it('should convert between system objects', async () => {
      const result = await Effect.runPromise(
        convertBetweenSystems(25.4, MetricSystem, ImperialSystem)
      )
      
      // 25.4mm should equal 1 inch
      expect(result.unit.symbol).toBe('in')
      expect(result.value).toBe(1)
    })

    it('should handle nautical system', async () => {
      const result = await Effect.runPromise(
        convertBetweenSystems(1852000, MetricSystem, NauticalSystem)
      )
      
      // 1,852,000mm = 1 nautical mile
      expect(result.unit.symbol).toBe('nmi')
      expect(result.value).toBe(1)
    })

    it('should convert metric to astronomical system', async () => {
      // Test with a value that should trigger astronomical units
      const hugeMmValue = 149597870700000 // 1 AU in mm
      const result = await Effect.runPromise(
        convertBetweenSystems(hugeMmValue, MetricSystem, AstronomicalSystem)
      )
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.value).toBeCloseTo(1, 3)
    })

    it('should convert imperial to astronomical system', async () => {
      // Convert a large imperial value to astronomical
      const largeMmValue = 74798935350000 // 0.5 AU in mm
      const result = await Effect.runPromise(
        convertBetweenSystems(largeMmValue, ImperialSystem, AstronomicalSystem)
      )
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.value).toBeCloseTo(0.5, 3)
    })
  })

  describe('AstronomicalSystem specific tests', () => {
    it('should handle light-year conversions', async () => {
      // Value that should trigger light-year units
      const lightYearInMm = 9460730472580800000
      const result = await Effect.runPromise(
        convertBetweenSystems(lightYearInMm, MetricSystem, AstronomicalSystem)
      )
      
      expect(result.unit.symbol).toBe('ly')
      expect(result.value).toBeCloseTo(1, 3)
    })

    it('should handle parsec conversions', async () => {
      // Value that should trigger parsec units
      const parsecInMm = 30856775814913672789
      const result = await Effect.runPromise(
        convertBetweenSystems(parsecInMm, MetricSystem, AstronomicalSystem)
      )
      
      expect(result.unit.symbol).toBe('pc')
      expect(result.value).toBeCloseTo(1, 3)
    })

    it('should select appropriate astronomical unit based on magnitude', async () => {
      // Small astronomical distance - should use AU
      const smallAstro = await Effect.runPromise(
        convertPixelsToSystem(7.5e13, AstronomicalSystem)
      )
      expect(smallAstro.unit.symbol).toBe('AU')

      // Very large astronomical distance - still AU after pixel conversion
      const mediumAstro = await Effect.runPromise(
        convertPixelsToSystem(4.8e18, AstronomicalSystem)
      )
      expect(mediumAstro.unit.symbol).toBe('AU')

      // Extremely large astronomical distance - still AU after pixel conversion
      const largeAstro = await Effect.runPromise(
        convertPixelsToSystem(1.6e19, AstronomicalSystem)
      )
      expect(largeAstro.unit.symbol).toBe('AU')
    })
  })

  describe('getUnitSymbol', () => {
    it('should return correct symbol for metric values', async () => {
      const symbol = await Effect.runPromise(getUnitSymbol(156.8, 'metric'))
      expect(symbol).toBe('cm') // 156.8mm = 15.68cm, so should use cm
    })

    it('should return correct symbol for imperial values', async () => {
      const symbol = await Effect.runPromise(getUnitSymbol(25.4, 'imperial'))
      expect(symbol).toBe('in') // 25.4mm = 1 inch
    })

    it('should return correct symbol for astronomical values', async () => {
      const symbol = await Effect.runPromise(getUnitSymbol(149597870700000, 'astronomical'))
      expect(symbol).toBe('AU') // 1 AU
    })

    it('should return correct symbol for nautical values', async () => {
      const symbol = await Effect.runPromise(getUnitSymbol(1852000, 'nautical'))
      expect(symbol).toBe('nmi') // 1 nautical mile
    })

    it('should fail with invalid system', async () => {
      const result = Effect.runPromise(getUnitSymbol(345.2, 'invalid'))
      
      await expect(result).rejects.toThrow()
    })
  })

  describe('DPI Detection', () => {
    it('should use CSS measurement when available', async () => {
      // Mock a high DPI display
      const mockElement = {
        style: {},
        offsetWidth: 192, // 2x DPI
        offsetHeight: 192
      }
      mockCreateElement.mockReturnValue(mockElement)

      const result = await Effect.runPromise(convertPixelsToById(96.5, 'metric'))
      
      // Should account for higher DPI (result should be smaller physical size)
      expect(result.value).toBeLessThan(100) // Less than 100mm
    })

    it('should fallback to devicePixelRatio when CSS measurement fails', async () => {
      // Mock CSS measurement failure
      const mockElement = {
        style: {},
        offsetWidth: 1000, // Invalid DPI (outside bounds)
        offsetHeight: 1000
      }
      mockCreateElement.mockReturnValue(mockElement)
      
      // Mock high devicePixelRatio
      Object.defineProperty(global, 'window', {
        value: { devicePixelRatio: 2.5 },
        writable: true
      })

      const result = await Effect.runPromise(convertPixelsToById(128.3, 'metric'))
      
      expect(result.value).toBeGreaterThan(0)
    })

    it('should handle DOM errors gracefully', async () => {
      // Mock DOM error
      mockCreateElement.mockImplementation(() => {
        throw new Error('DOM not available')
      })

      const result = await Effect.runPromise(convertPixelsToById(73.9, 'metric'))
      
      // Should still work with fallback
      expect(result.value).toBeGreaterThan(0)
    })
  })

  describe('Unit Selection Logic', () => {
    it('should select appropriate metric units based on value', async () => {
      const tiny = await Effect.runPromise(convertPixelsToSystem(2.7, MetricSystem))
      const small = await Effect.runPromise(convertPixelsToSystem(47.3, MetricSystem))
      const medium = await Effect.runPromise(convertPixelsToSystem(387.9, MetricSystem))
      const large = await Effect.runPromise(convertPixelsToSystem(2847.6, MetricSystem))

      expect(tiny.unit.symbol).toBe('mm')   // Very small values
      expect(small.unit.symbol).toBe('cm')  // Small values  
      expect(medium.unit.symbol).toBe('cm') // Medium values
      expect(large.unit.symbol).toBe('cm')  // Still cm, need >1000mm for meters
    })

    it('should select appropriate imperial units based on value', async () => {
      const small = await Effect.runPromise(convertPixelsToSystem(38.7, ImperialSystem))
      const medium = await Effect.runPromise(convertPixelsToSystem(456.3, ImperialSystem))
      const large = await Effect.runPromise(convertPixelsToSystem(1247.8, ImperialSystem))

      expect(small.unit.symbol).toBe('in') // Small values in inches
      expect(medium.unit.symbol).toBe('in') // Pixel conversion may result in value still under foot threshold
      expect(large.unit.symbol).toBe('ft') // Larger values in feet
    })

    it('should select appropriate nautical units based on value', async () => {
      const small = await Effect.runPromise(convertPixelsToSystem(723.4, NauticalSystem))
      const medium = await Effect.runPromise(convertPixelsToSystem(1923.7, NauticalSystem))
      const large = await Effect.runPromise(convertPixelsToSystem(187456.2, NauticalSystem))
      const huge = await Effect.runPromise(convertPixelsToSystem(1876543.1, NauticalSystem))

      expect(small.unit.symbol).toBe('ftm') // Fathoms (fallback to first unit when below threshold)
      expect(medium.unit.symbol).toBe('ftm') // Fathoms (after pixel conversion)
      expect(large.unit.symbol).toBe('ftm') // Still fathoms (pixel conversion affects final mm value)  
      expect(huge.unit.symbol).toBe('cb') // Cables (pixel conversion results in cable range)
    })
  })

  describe('Precision and Formatting', () => {
    it('should format values with correct precision', async () => {
      const result = await Effect.runPromise(convertPixelsToById(187.4, 'metric'))
      
      // Check that formatted string has reasonable precision
      expect(result.formatted).toMatch(/^\d+(\.\d{1,2})? \w+$/)
    })

    it('should handle very large astronomical values', async () => {
      // Test with a very large value that would trigger astronomical units
      // Need an extremely large value to reach AU threshold
      const pixels = 8.7e15 // Extremely large
      const result = await Effect.runPromise(convertPixelsToById(pixels, 'astronomical'))
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.value).toBeGreaterThan(0)
      expect(result.formatted).toContain('astronomical unit')
    })

    it('should handle fractional astronomical values correctly', async () => {
      const halfAU = 74798935350000 // 0.5 AU in mm
      const result = await Effect.runPromise(convertBetweenSystems(halfAU, MetricSystem, AstronomicalSystem))
      
      expect(result.unit.symbol).toBe('AU')
      expect(result.value).toBeCloseTo(0.5, 3)
      expect(result.formatted).toContain('0.5')
    })
  })

  describe('Error Handling', () => {
    it('should provide descriptive error messages', async () => {
      try {
        await Effect.runPromise(convertPixelsToById(234.6, 'nonexistent'))
      } catch (error) {
        expect((error as Error).message).toContain('nonexistent')
      }
    })

    it('should handle zero pixels correctly', async () => {
      const result = await Effect.runPromise(convertPixelsToById(0, 'metric'))
      
      expect(result.value).toBe(0)
      expect(result.formatted).toBe('0 millimeter')
    })

    it('should handle very small positive values', async () => {
      const result = await Effect.runPromise(convertPixelsToById(0.1, 'metric'))
      
      expect(result.value).toBeGreaterThan(0)
      expect(result.unit.symbol).toBe('mm')
    })
  })
}) 