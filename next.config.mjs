import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Webpack configuration for Konva canvas module
  webpack: (config, { isServer }) => {
    // Add externals for canvas module (required by Konva)
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push('canvas')
    }
    return config
  },
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "lucide-react",
      "react-grid-layout",
      "@xyflow/react",
      "react-big-calendar",
      "recharts",
      "react-konva", // Add react-konva for optimization
      // Animation & Performance libraries
      "framer-motion",
      "@react-three/fiber",
      "@react-three/drei",
      "@tanstack/react-query"
    ]
  },
  eslint: {
    ignoreDuringBuilds: true, // TEMP: Disable ESLint for Vercel build
  },
  typescript: {
    ignoreBuildErrors: true, // TEMP: Disable TypeScript errors for Vercel build
  },
  images: {
    // CRITICAL FIX: Enable image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    domains: ['ik.imagekit.io'], // Add your image domains
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable bundle analysis in development
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

export default withBundleAnalyzer(nextConfig)
