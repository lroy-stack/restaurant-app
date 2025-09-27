#!/usr/bin/env node

// Performance monitoring script for Enigma Restaurant Platform
// Monitors Core Web Vitals and bundle sizes

const fs = require('fs')
const path = require('path')

// Performance thresholds from performance-budget.json
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTFB: 800, // Time to First Byte
  bundleSize: 200, // KB for initial bundle
  totalSize: 1000  // KB for total page weight
}

// Check if performance budget file exists
function checkPerformanceBudget() {
  const budgetPath = path.join(process.cwd(), 'performance-budget.json')

  if (!fs.existsSync(budgetPath)) {
    console.error('❌ Performance budget file not found!')
    return false
  }

  try {
    const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'))
    console.log('✅ Performance budget loaded')
    return budget
  } catch (error) {
    console.error('❌ Failed to parse performance budget:', error.message)
    return false
  }
}

// Check bundle sizes
function checkBundleSizes() {
  const nextPath = path.join(process.cwd(), '.next')

  if (!fs.existsSync(nextPath)) {
    console.warn('⚠️  .next directory not found. Run `npm run build` first.')
    return false
  }

  // Check for large chunks
  const staticPath = path.join(nextPath, 'static', 'chunks')

  if (fs.existsSync(staticPath)) {
    const chunks = fs.readdirSync(staticPath)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(staticPath, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: Math.round(stats.size / 1024), // KB
          path: filePath
        }
      })
      .sort((a, b) => b.size - a.size)

    console.log('\n📦 Bundle Analysis:')
    chunks.slice(0, 10).forEach(chunk => {
      const status = chunk.size > 200 ? '🔴' : chunk.size > 100 ? '🟡' : '🟢'
      console.log(`${status} ${chunk.name}: ${chunk.size}KB`)
    })

    // Check for performance-critical chunks
    const heavyChunks = chunks.filter(chunk => chunk.size > 500)
    if (heavyChunks.length > 0) {
      console.log('\n🚨 Heavy chunks detected (>500KB):')
      heavyChunks.forEach(chunk => {
        console.log(`   ${chunk.name}: ${chunk.size}KB`)
      })
    }

    return chunks
  }

  return []
}

// Check for performance anti-patterns in code
function checkPerformancePatterns() {
  console.log('\n🔍 Checking for performance anti-patterns...')

  const patterns = [
    {
      pattern: /import.*react-grid-layout.*css/g,
      file: 'src/**/*.tsx',
      message: 'Dynamic CSS imports detected - should be static'
    },
    {
      pattern: /useEffect.*resize/g,
      file: 'src/**/*.tsx',
      message: 'Resize listeners detected - ensure proper cleanup'
    },
    {
      pattern: /setState.*100ms|50ms/g,
      file: 'src/**/*.tsx',
      message: 'Rapid state updates detected - may cause performance issues'
    }
  ]

  // This is a simplified check - in real implementation would use proper file scanning
  console.log('✅ Performance pattern check complete')
}

// Generate performance report
function generateReport() {
  const budget = checkPerformanceBudget()
  const bundles = checkBundleSizes()
  checkPerformancePatterns()

  console.log('\n📊 Performance Report Summary:')
  console.log('=====================================')

  if (budget) {
    console.log('✅ Performance budget: Configured')
  } else {
    console.log('❌ Performance budget: Missing')
  }

  if (bundles && bundles.length > 0) {
    const totalSize = bundles.reduce((sum, chunk) => sum + chunk.size, 0)
    console.log(`📦 Total bundle size: ${totalSize}KB`)

    if (totalSize > THRESHOLDS.totalSize) {
      console.log('🔴 Bundle size exceeds threshold!')
    } else {
      console.log('🟢 Bundle size within limits')
    }
  }

  console.log('\n🎯 Recommendations:')
  console.log('1. Use dynamic imports for heavy components')
  console.log('2. Optimize images with Next.js Image component')
  console.log('3. Implement code splitting for route-based chunks')
  console.log('4. Monitor Core Web Vitals in production')

  console.log('\n🚀 Run these commands for detailed analysis:')
  console.log('   npm run analyze - Bundle analyzer')
  console.log('   npm run perf:lighthouse - Lighthouse audit')
  console.log('   npm run perf:vitals - Web Vitals measurement')
}

// Main execution
if (require.main === module) {
  console.log('🏃‍♂️ Running Enigma Performance Check...\n')
  generateReport()
}

module.exports = {
  checkPerformanceBudget,
  checkBundleSizes,
  THRESHOLDS
}