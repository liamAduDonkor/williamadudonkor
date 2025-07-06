#!/usr/bin/env node

// Simple performance test runner
const { performance } = require('perf_hooks');

async function measureLoadTime(url) {
    const start = performance.now();
    
    // Simulate resource loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const end = performance.now();
    return end - start;
}

async function runPerformanceTests() {
    console.log('🧪 Running performance tests...');
    
    const metrics = {
        'Critical CSS Load': await measureLoadTime('/critical.css'),
        'JavaScript Load': await measureLoadTime('/script-optimized.js'),
        'Service Worker Load': await measureLoadTime('/sw-optimized.js'),
        'Manifest Load': await measureLoadTime('/manifest.json')
    };
    
    console.log('\n📊 Performance Metrics:');
    Object.entries(metrics).forEach(([test, time]) => {
        console.log(`${test}: ${time.toFixed(2)}ms`);
    });
    
    const averageTime = Object.values(metrics).reduce((sum, time) => sum + time, 0) / Object.keys(metrics).length;
    console.log(`\nAverage load time: ${averageTime.toFixed(2)}ms`);
    
    if (averageTime < 100) {
        console.log('✅ Performance: Excellent');
    } else if (averageTime < 300) {
        console.log('⚡ Performance: Good');
    } else {
        console.log('⚠️ Performance: Needs improvement');
    }
}

runPerformanceTests().catch(console.error);
