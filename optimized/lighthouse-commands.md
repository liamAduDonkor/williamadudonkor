
# Performance Testing Commands

## Lighthouse Performance Audit
npx lighthouse http://localhost:3000 --output=html --output-path=./performance-report.html --chrome-flags="--headless"

## Core Web Vitals Testing
npx @lhci/cli autorun --upload.target=temporary-public-storage

## Bundle Analysis
npx webpack-bundle-analyzer ./optimized --port 8888

## Performance Monitoring
# Add these to your monitoring setup:
# - First Contentful Paint (FCP)
# - Largest Contentful Paint (LCP)
# - First Input Delay (FID)
# - Cumulative Layout Shift (CLS)
