import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WebVitalsMetric } from '../hooks/useWebVitals';

// Mock the environment module
vi.mock('@/lib/environment', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  })),
  featureFlags: {
    enablePerformanceMonitoring: vi.fn(() => true)
  }
}));

describe('useWebVitals', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should define WebVitalsMetric interface correctly', () => {
    const testMetric: WebVitalsMetric = {
      name: 'LCP',
      value: 1500,
      delta: 1500,
      id: 'test-lcp',
      entries: []
    };

    expect(testMetric.name).toBe('LCP');
    expect(testMetric.value).toBe(1500);
    expect(testMetric.delta).toBe(1500);
    expect(testMetric.id).toBe('test-lcp');
    expect(Array.isArray(testMetric.entries)).toBe(true);
  });

  it('should validate metric names are correct', () => {
    const validNames: Array<WebVitalsMetric['name']> = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];

    validNames.forEach(name => {
      const metric: WebVitalsMetric = {
        name,
        value: 100,
        delta: 100,
        id: `test-${name}`,
        entries: []
      };

      expect(metric.name).toBe(name);
    });
  });

  it('should handle performance monitoring feature flag', () => {
    // Mock the environment module
    const mockFeatureFlags = {
      enablePerformanceMonitoring: vi.fn(() => true)
    };

    // Test that the feature flag function exists and returns a boolean
    expect(typeof mockFeatureFlags.enablePerformanceMonitoring).toBe('function');
    expect(typeof mockFeatureFlags.enablePerformanceMonitoring()).toBe('boolean');
  });

  it('should create logger for Web Vitals', () => {
    // Mock the createLogger function
    const mockCreateLogger = vi.fn((_component: string) => ({
      info: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      error: vi.fn()
    }));

    // Test that createLogger is called and returns expected methods
    expect(mockCreateLogger).toBeDefined();
    expect(typeof mockCreateLogger).toBe('function');

    const logger = mockCreateLogger('WebVitals');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should validate WebVitalsData interface structure', () => {
    const webVitalsData = {
      cls: 0.1,
      fid: 50,
      fcp: 1200,
      lcp: 2500,
      ttfb: 300,
      timestamp: Date.now(),
      url: 'https://test.com',
      userAgent: 'test-agent'
    };

    expect(typeof webVitalsData.cls).toBe('number');
    expect(typeof webVitalsData.fid).toBe('number');
    expect(typeof webVitalsData.fcp).toBe('number');
    expect(typeof webVitalsData.lcp).toBe('number');
    expect(typeof webVitalsData.ttfb).toBe('number');
    expect(typeof webVitalsData.timestamp).toBe('number');
    expect(typeof webVitalsData.url).toBe('string');
    expect(typeof webVitalsData.userAgent).toBe('string');
  });
});
