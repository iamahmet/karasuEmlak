import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Bundle analyzer (only when ANALYZE=true)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  
  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // TypeScript & ESLint optimizations for build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.picsum.photos',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Optimized sizes for mobile-first approach
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for better performance
  experimental: {
    instrumentationHook: true,
    serverSourceMaps: true,
    optimizePackageImports: ['@karasu/ui', '@karasu/lib', 'lucide-react'],
    // Optimize CSS
    optimizeCss: true,
    // Enable partial prerendering for faster page loads
    ppr: false, // Will enable when stable
    // Optimize server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Core Web Vitals optimizations
    optimizeCss: true,
    // Font optimization
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
  
  // Core Web Vitals: LCP optimization
  // Preload critical resources
  async rewrites() {
    return [];
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(js|css|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Performance optimizations
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    config.devtool = 'source-map';
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Client-side bundle optimization for mobile performance
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          moduleIds: 'deterministic',
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Separate vendor chunks for better caching
              framework: {
                name: 'framework',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
                priority: 40,
                enforce: true,
              },
              lib: {
                test(module) {
                  return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
                },
                name(module) {
                  const hash = require('crypto').createHash('sha1');
                  hash.update(module.identifier());
                  return hash.digest('hex').substring(0, 8);
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 20,
              },
              shared: {
                name(module, chunks) {
                  return require('crypto')
                    .createHash('sha1')
                    .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                    .digest('hex')
                    .substring(0, 8);
                },
                priority: 10,
                minChunks: 2,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
    } else {
      // Server-side: Disable chunk splitting to avoid vendor-chunks issues
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: false,
      };
    }
    
    return config;
  },

  // Output configuration
  output: 'standalone',
  
  // Security headers are now set in proxy.ts for better control and nonce support
  // async headers() removed to avoid conflicts
};

// Wrap with Sentry if DSN is provided, then bundle analyzer
const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      withNextIntl(nextConfig),
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options
        
        // Suppresses source map uploading logs during build
        silent: true,
        
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
        
        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,
        
        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,
        
        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // This can increase your server load as well as your hosting bill.
        // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
        // side errors will fail.
        tunnelRoute: '/monitoring',
        
        // Hides source maps from generated client bundles
        hideSourceMaps: true,
        
        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
        
        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
      }
    )
  : withNextIntl(nextConfig);

// PWA configuration - Disable in development to avoid sw.js errors
const pwaConfig = process.env.NODE_ENV === 'development'
  ? (config) => config // Skip PWA entirely in development
  : withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      sw: 'sw.js',
      fallbacks: {
        document: '/offline.html',
      },
  // Custom service worker for push notifications
  importScripts: ['/sw-custom.js'],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'imageCache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff|woff2|ttf|otf)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'staticCache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
});

// Apply PWA, then bundle analyzer
export default withBundleAnalyzer(pwaConfig(configWithSentry));
