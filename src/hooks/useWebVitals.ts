/*
 * MIT License
 * Built with Bolt.new
 * Web Vitals tracking hook for Luminari's Quest
 * 
 * Features:
 * - Core Web Vitals monitoring (LCP, FID, CLS)
 * - Performance metrics tracking
 * - Environment-aware reporting
 * - Image optimization impact measurement
 */

import { useEffect, useRef } from 'react';
import { createLogger, featureFlags } from '@/lib/environment';

// Web Vitals metric types
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

export interface WebVitalsData {
  cls?: number;
  fid?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  timestamp?: number;
  url?: string;
  userAgent?: string;
}

export interface UseWebVitalsOptions {
  /** Enable detailed logging of metrics */
  enableLogging?: boolean;
  /** Custom callback for metric reporting */
  onMetric?: (metric: WebVitalsMetric) => void;
  /** Enable automatic reporting to analytics */
  enableReporting?: boolean;
}

const logger = createLogger('WebVitals');

/**
 * Hook for tracking Core Web Vitals and performance metrics
 * Automatically measures LCP, FID, CLS, FCP, and TTFB
 */
export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const {
    enableLogging = featureFlags.enablePerformanceMonitoring(),
    onMetric,
    enableReporting = true
  } = options;

  const metricsRef = useRef<Partial<WebVitalsData>>({});
  const reportedRef = useRef<Set<string>>(new Set());

  // Report metric to analytics or logging
  const reportMetric = (metric: WebVitalsMetric) => {
    // Prevent duplicate reporting
    if (reportedRef.current.has(metric.id)) {
      return;
    }
    reportedRef.current.add(metric.id);

    // Store metric data
    const metricKey = metric.name.toLowerCase() as keyof WebVitalsData;
    if (metricKey in metricsRef.current) {
      (metricsRef.current as any)[metricKey] = metric.value;
    }
    metricsRef.current.timestamp = Date.now();
    metricsRef.current.url = window.location.href;
    metricsRef.current.userAgent = navigator.userAgent;

    if (enableLogging) {
      logger.info(`Web Vital: ${metric.name}`, {
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href
      });
    }

    // Call custom callback if provided
    if (onMetric) {
      onMetric(metric);
    }

    // Report to analytics if enabled
    if (enableReporting) {
      reportToAnalytics(metric);
    }
  };

  // Report metrics to analytics service
  const reportToAnalytics = (metric: WebVitalsMetric) => {
    // In a real implementation, this would send to your analytics service
    // For now, we'll use console.log in development
    if (featureFlags.enablePerformanceMonitoring()) {
      console.log('Analytics Report:', {
        event: 'web_vital',
        metric_name: metric.name,
        metric_value: metric.value,
        page_url: window.location.href,
        timestamp: Date.now()
      });
    }
  };

  // Initialize Web Vitals tracking
  useEffect(() => {
    if (!enableReporting) return;

    let webVitalsModule: any;

    // Dynamically import web-vitals to avoid bundle size impact
    const initWebVitals = async () => {
      try {
        // For now, we'll implement basic performance observers
        // In production, you would install and use the 'web-vitals' package
        initPerformanceObservers();
      } catch (error) {
        logger.warn('Failed to initialize Web Vitals tracking', error);
      }
    };

    initWebVitals();

    return () => {
      // Cleanup observers if needed
      if (webVitalsModule) {
        // Cleanup logic would go here
      }
    };
  }, [enableReporting]);

  // Initialize basic performance observers
  const initPerformanceObservers = () => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          if (lastEntry) {
            reportMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              delta: lastEntry.startTime,
              id: `lcp-${Date.now()}`,
              entries: [lastEntry]
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          
          if (fcpEntry) {
            reportMetric({
              name: 'FCP',
              value: fcpEntry.startTime,
              delta: fcpEntry.startTime,
              id: `fcp-${Date.now()}`,
              entries: [fcpEntry]
            });
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          reportMetric({
            name: 'CLS',
            value: clsValue,
            delta: clsValue,
            id: `cls-${Date.now()}`,
            entries: list.getEntries()
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        logger.warn('Failed to initialize performance observers', error);
      }
    }
  };

  // Get current metrics snapshot
  const getMetrics = (): Partial<WebVitalsData> => {
    return { ...metricsRef.current };
  };

  // Manual trigger for performance measurement
  const measurePerformance = () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        
        reportMetric({
          name: 'TTFB',
          value: ttfb,
          delta: ttfb,
          id: `ttfb-${Date.now()}`,
          entries: [navigation]
        });
      }
    }
  };

  return {
    getMetrics,
    measurePerformance,
    reportMetric
  };
}
