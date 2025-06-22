/*
 * MIT License
 * Built with Bolt.new
 * Lighthouse CI configuration for Luminari's Quest
 * 
 * Features:
 * - Performance budget monitoring
 * - Core Web Vitals tracking
 * - Image optimization impact measurement
 * - Automated performance regression detection
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:5173',
        'http://localhost:5173/adventure',
        'http://localhost:5173/progress',
        'http://localhost:5173/profile'
      ],
      // Number of runs for each URL
      numberOfRuns: 3,
      // Settings for collection
      settings: {
        // Only run performance audits for faster execution
        onlyCategories: ['performance'],
        // Chrome flags for consistent testing
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        // Throttling settings to simulate real-world conditions
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        // Emulate mobile device for mobile-first testing
        emulatedFormFactor: 'mobile',
        // Skip certain audits that aren't relevant for development
        skipAudits: [
          'canonical',
          'robots-txt',
          'hreflang',
          'structured-data'
        ]
      }
    },
    assert: {
      // Performance budget assertions
      assertions: {
        // Core Web Vitals thresholds
        'categories:performance': ['warn', { minScore: 0.8 }],
        'metrics:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'metrics:first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'metrics:speed-index': ['warn', { maxNumericValue: 3000 }],
        'metrics:total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Image optimization specific audits
        'audits:modern-image-formats': ['warn', { minScore: 0.8 }],
        'audits:uses-optimized-images': ['warn', { minScore: 0.8 }],
        'audits:uses-responsive-images': ['warn', { minScore: 0.8 }],
        'audits:efficient-animated-content': ['warn', { minScore: 0.8 }],
        
        // Performance best practices
        'audits:render-blocking-resources': ['warn', { minScore: 0.8 }],
        'audits:unused-css-rules': ['warn', { minScore: 0.8 }],
        'audits:unused-javascript': ['warn', { minScore: 0.8 }],
        'audits:uses-text-compression': ['warn', { minScore: 0.8 }],
        
        // Resource optimization
        'audits:total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        'audits:dom-size': ['warn', { maxNumericValue: 1500 }]
      }
    },
    upload: {
      // For CI/CD integration, you can configure upload to Lighthouse CI server
      // For now, we'll use temporary public storage for development
      target: 'temporary-public-storage'
    },
    server: {
      // Optional: Configure LHCI server for team collaboration
      // url: 'https://your-lhci-server.com',
      // token: 'your-build-token'
    }
  }
};

// Performance budget configuration for different environments
const performanceBudgets = {
  development: {
    // More lenient budgets for development
    'metrics:largest-contentful-paint': 3000,
    'metrics:cumulative-layout-shift': 0.15,
    'metrics:first-contentful-paint': 2000
  },
  staging: {
    // Stricter budgets for staging
    'metrics:largest-contentful-paint': 2500,
    'metrics:cumulative-layout-shift': 0.1,
    'metrics:first-contentful-paint': 1800
  },
  production: {
    // Strictest budgets for production
    'metrics:largest-contentful-paint': 2000,
    'metrics:cumulative-layout-shift': 0.05,
    'metrics:first-contentful-paint': 1500
  }
};

// Export budgets for use in other tools
module.exports.performanceBudgets = performanceBudgets;
