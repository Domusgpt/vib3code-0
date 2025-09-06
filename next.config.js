/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development vs Production config
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
    assetPrefix: '/vib3code-0',
    basePath: '/vib3code-0',
  } : {
    // Development-only config
    reactStrictMode: true,
    swcMinify: true,
  }),
  
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Handle GLSL shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    
    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
        },
      },
    });

    return config;
  },
}

module.exports = nextConfig;