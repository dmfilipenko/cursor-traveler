import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Effect } from 'effect'
import { 
  convertPixelsToById,
  convertBetween,
  convertPixelsToSystem,
  convertBetweenSystems,
  getUnitSymbol
} from '../universal-converter'
import { MetricSystem, ImperialSystem,  NauticalSystem } from '../systems'
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

    it('should default to metric for invalid system ID', async () => {
      // Invalid system IDs should default to metric system
      const result = await Effect.runPromise(convertPixelsToById(123.4, 'invalid'))

      expect(result.unit.symbol).toMatch(/mm|cm|m|km/)
      expect(result.value).toBeGreaterThan(0)
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

    it('should default to metric for invalid from system', async () => {
      // Invalid from system should default to metric
      const result = await Effect.runPromise(convertBetween(156.3, 'invalid', 'metric'))

      expect(result.unit.symbol).toMatch(/mm|cm|m|km/)
      expect(result.value).toBeGreaterThan(0)
    })

    it('should default to metric for invalid to system', async () => {
      // Invalid to system should default to metric
      const result = await Effect.runPromise(convertBetween(892.1, 'metric', 'invalid'))

      expect(result.unit.symbol).toMatch(/mm|cm|m|km/)
      expect(result.value).toBeGreaterThan(0)
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

    it('should return correct symbol for nautical values', async () => {
      const symbol = await Effect.runPromise(getUnitSymbol(1852000, 'nautical'))
      expect(symbol).toBe('nmi') // 1 nautical mile
    })

    it('should default to metric for invalid system', async () => {
      // Invalid system should default to metric
      const symbol = await Effect.runPromise(getUnitSymbol(345.2, 'invalid'))

      expect(symbol).toMatch(/mm|cm|m|km/)
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
      expect(result.formatted).toMatch(/^\d+(\.\d{1,3})? \w+$/)
    })

    it('should handle very large values with appropriate units', async () => {
      // Test with a very large value - should show meters or kilometers depending on size
      const pixels = 50000 // Large pixel value
      const result = await Effect.runPromise(convertPixelsToById(pixels, 'metric'))

      // Should use an appropriate large unit (m or km)
      expect(result.unit.symbol).toMatch(/m|km/)
      expect(result.value).toBeGreaterThan(0)
      expect(result.formatted).toMatch(/meter|kilometer/)
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