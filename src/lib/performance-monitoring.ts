/*
 * MIT License
 
 * Performance monitoring utilities for Luminari's Quest
 * 
 * Features:
 * - Web Vitals integration
 * - Performance budget monitoring
 * - Image optimization impact tracking
 * - Environment-aware reporting
 */

import { createLogger, featureFlags } from '@/lib/environment';
import type { WebVitalsMetric } from '@/hooks/useWebVitals';

const logger = createLogger('PerformanceMonitoring');

export interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
  imageOptimization: {
    totalImageSize: number;
    optimizedImages: number;
    totalImages: number;
    compressionRatio: number;
  };
}

export interface PerformanceBudgetAlert {
  metric: string;
  value: number;
  budget: number;
  severity: 'warning' | 'error';
  timestamp: number;
  url: string;
}

// Performance budgets for different metrics
const PERFORMANCE_BUDGETS = {
  lcp: { warning: 2500, error: 4000 },
  fid: { warning: 100, error: 300 },
  cls: { warning: 0.1, error: 0.25 },
  fcp: { warning: 1800, error: 3000 },
  ttfb: { warning: 800, error: 1800 },
  imageSize: { warning: 800000, error: 1600000 } // bytes
};

/**
 * Check if a metric value exceeds performance budget
 */
export function checkPerformanceBudget(
  metric: string,
  value: number
): PerformanceBudgetAlert | null {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget) return null;

  let severity: 'warning' | 'error' | null = null;
  let budgetValue = 0;

  if (value > budget.error) {
    severity = 'error';
    budgetValue = budget.error;
  } else if (value > budget.warning) {
    severity = 'warning';
    budgetValue = budget.warning;
  }

  if (!severity) return null;

  return {
    metric,
    value,
    budget: budgetValue,
    severity,
    timestamp: Date.now(),
    url: window.location.href
  };
}

/**
 * Report Web Vitals metric to analytics
 */
export function reportWebVital(metric: WebVitalsMetric): void {
  if (!featureFlags.enablePerformanceMonitoring()) {
    return;
  }

  logger.info(`Web Vital: ${metric.name}`, {
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href
  });

  // Check performance budget
  const budgetAlert = checkPerformanceBudget(
    metric.name.toLowerCase(),
    metric.value
  );

  if (budgetAlert) {
    logger.warn('Performance budget exceeded', budgetAlert);
    
    // In production, you would send this to your monitoring service
    if (featureFlags.enablePerformanceMonitoring()) {
      console.warn('Performance Budget Alert:', budgetAlert);
    }
  }

  // Report to analytics service (placeholder)
  reportToAnalytics({
    event: 'web_vital',
    metric_name: metric.name,
    metric_value: metric.value,
    page_url: window.location.href,
    timestamp: Date.now()
  });
}

/**
 * Track image optimization impact
 */
export function trackImageOptimization(): void {
  if (!featureFlags.enablePerformanceMonitoring()) {
    return;
  }

  // Get all images on the page
  const images = document.querySelectorAll('img');
  let totalSize = 0;
  let optimizedCount = 0;
  
  images.forEach(img => {
    // Check if image uses optimized formats (AVIF/WebP)
    const src = img.src || img.currentSrc;
    if (src && (src.includes('.avif') || src.includes('.webp'))) {
      optimizedCount++;
    }
    
    // Estimate image size (this is approximate)
    // In a real implementation, you'd track actual transfer sizes
    if (img.naturalWidth && img.naturalHeight) {
      const estimatedSize = img.naturalWidth * img.naturalHeight * 0.5; // rough estimate
      totalSize += estimatedSize;
    }
  });

  const report = {
    totalImages: images.length,
    optimizedImages: optimizedCount,
    totalImageSize: totalSize,
    compressionRatio: optimizedCount / images.length,
    timestamp: Date.now(),
    url: window.location.href
  };

  logger.info('Image optimization report', report);

  // Check image size budget
  const budgetAlert = checkPerformanceBudget('imageSize', totalSize);
  if (budgetAlert) {
    logger.warn('Image size budget exceeded', budgetAlert);
  }

  // Report to analytics
  reportToAnalytics({
    event: 'image_optimization',
    ...report
  });
}

/**
 * Generate comprehensive performance report
 */
export function generatePerformanceReport(metrics: Record<string, number>): PerformanceReport {
  const report: PerformanceReport = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    metrics: {
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      fcp: metrics.fcp,
      ttfb: metrics.ttfb
    },
    imageOptimization: {
      totalImageSize: 0,
      optimizedImages: 0,
      totalImages: 0,
      compressionRatio: 0
    }
  };

  // Add image optimization data
  const images = document.querySelectorAll('img');
  let optimizedCount = 0;
  
  images.forEach(img => {
    const src = img.src || img.currentSrc;
    if (src && (src.includes('.avif') || src.includes('.webp'))) {
      optimizedCount++;
    }
  });

  report.imageOptimization = {
    totalImages: images.length,
    optimizedImages: optimizedCount,
    totalImageSize: 0, // Would need actual size tracking
    compressionRatio: optimizedCount / images.length
  };

  return report;
}

/**
 * Placeholder for analytics reporting
 * In production, replace with your analytics service
 */
function reportToAnalytics(data: Record<string, any>): void {
  if (featureFlags.enablePerformanceMonitoring()) {
    console.log('Analytics Report:', data);
  }
  
  // Example integrations:
  // - Google Analytics 4: gtag('event', data.event, data)
  // - Mixpanel: mixpanel.track(data.event, data)
  // - Custom API: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) })
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (!featureFlags.enablePerformanceMonitoring()) {
    logger.debug('Performance monitoring disabled');
    return;
  }

  logger.info('Initializing performance monitoring');

  // Track image optimization on page load
  if (document.readyState === 'complete') {
    trackImageOptimization();
  } else {
    window.addEventListener('load', trackImageOptimization);
  }

  // Track navigation performance
  if ('performance' in window && 'getEntriesByType' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      reportToAnalytics({
        event: 'navigation_timing',
        ttfb,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        load_complete: navigation.loadEventEnd - navigation.fetchStart,
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }
}
