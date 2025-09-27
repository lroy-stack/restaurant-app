#!/bin/bash

# Enigma Performance Check Script
# ULTRATHINK PROACTIVE Performance Optimization

echo "🚀 ENIGMA PERFORMANCE OPTIMIZATION CHECK"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Performance check functions
check_bundle_size() {
    echo -e "\n${BLUE}📦 Bundle Size Analysis${NC}"
    if [ -d ".next" ]; then
        echo "Current bundle size:"
        du -sh .next/static/chunks/
        echo ""

        # Check for large chunks
        find .next/static/chunks/ -name "*.js" -size +500k -exec ls -lh {} \; | while read line; do
            echo -e "${YELLOW}⚠️  Large chunk detected:${NC} $(echo $line | awk '{print $9 " (" $5 ")"}')"
        done
    else
        echo -e "${RED}❌ No build found. Run 'npm run build' first${NC}"
    fi
}

check_image_optimization() {
    echo -e "\n${BLUE}🖼️  Image Optimization Status${NC}"
    if grep -q "unoptimized: true" next.config.mjs; then
        echo -e "${RED}❌ Image optimization is DISABLED${NC}"
        echo "   Fix: Remove 'unoptimized: true' from next.config.mjs"
    else
        echo -e "${GREEN}✅ Image optimization is ENABLED${NC}"
    fi
}

check_dependencies() {
    echo -e "\n${BLUE}📚 Dependency Analysis${NC}"

    # Check for unused heavy dependencies
    HEAVY_DEPS=("framer-motion" "recharts" "@xyflow/react" "leaflet" "react-leaflet")

    for dep in "${HEAVY_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            # Check if it's actually used in the code
            if ! grep -r "$dep" src/ > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Unused dependency detected:${NC} $dep"
                echo "   Recommendation: Remove with 'npm uninstall $dep'"
            else
                echo -e "${GREEN}✅ $dep is being used${NC}"
            fi
        fi
    done
}

check_dynamic_imports() {
    echo -e "\n${BLUE}⚡ Dynamic Import Analysis${NC}"

    DYNAMIC_COUNT=$(grep -r "dynamic\|React\.lazy" src/ 2>/dev/null | wc -l)
    SUSPENSE_COUNT=$(grep -r "Suspense" src/ 2>/dev/null | wc -l)

    echo "Dynamic imports found: $DYNAMIC_COUNT"
    echo "Suspense boundaries found: $SUSPENSE_COUNT"

    if [ $DYNAMIC_COUNT -lt 3 ]; then
        echo -e "${YELLOW}⚠️  Low dynamic import usage detected${NC}"
        echo "   Recommendation: Consider lazy loading heavy components"
    else
        echo -e "${GREEN}✅ Good dynamic import usage${NC}"
    fi
}

check_performance_monitoring() {
    echo -e "\n${BLUE}📊 Performance Monitoring${NC}"

    if [ -f "src/hooks/use-performance-monitor.tsx" ]; then
        echo -e "${GREEN}✅ Performance monitoring hook available${NC}"
    else
        echo -e "${RED}❌ No performance monitoring detected${NC}"
    fi

    if [ -f "performance-budget.json" ]; then
        echo -e "${GREEN}✅ Performance budget configured${NC}"
    else
        echo -e "${YELLOW}⚠️  No performance budget found${NC}"
    fi
}

run_lighthouse_if_available() {
    echo -e "\n${BLUE}🏠 Lighthouse Analysis${NC}"

    if command -v lighthouse &> /dev/null; then
        echo "Running Lighthouse analysis..."
        # Check if dev server is running
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            lighthouse http://localhost:3000 \
                --output-path=./reports/lighthouse-$(date +%Y%m%d_%H%M%S).html \
                --output=html \
                --quiet \
                --chrome-flags="--headless --no-sandbox"
            echo -e "${GREEN}✅ Lighthouse report saved to reports/${NC}"
        else
            echo -e "${YELLOW}⚠️  Dev server not running. Start with 'npm run dev'${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Lighthouse not installed. Install with: npm install -g lighthouse${NC}"
    fi
}

# Run all checks
echo "Starting performance analysis..."

check_image_optimization
check_dependencies
check_bundle_size
check_dynamic_imports
check_performance_monitoring

echo -e "\n${BLUE}🎯 Performance Optimization Summary${NC}"
echo "======================================"
echo "✅ Completed performance audit"
echo "📊 Check reports/ directory for detailed analysis"
echo ""
echo "Next steps:"
echo "1. npm run analyze    # Bundle analysis"
echo "2. npm run dev       # Start dev server"
echo "3. npm run perf:lighthouse # Run Lighthouse"
echo ""
echo -e "${GREEN}🚀 ULTRATHINK PROACTIVE Performance Check Complete!${NC}"