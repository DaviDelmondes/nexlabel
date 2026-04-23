import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Remove o header X-Powered-By por segurança
  poweredByHeader: false,

  // Compressão de respostas (gzip)
  compress: true,

  turbopack: {
    root: path.resolve(__dirname),
  },

  experimental: {
    // Otimiza imports de pacotes grandes: só carrega o que é usado
    optimizePackageImports: [
      '@supabase/ssr',
      '@supabase/supabase-js',
      'xlsx',
    ],
  },
}

export default nextConfig
