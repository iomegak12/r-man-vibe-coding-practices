const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add path aliases for cleaner imports
config.resolver.alias = {
  '@': './src',
  '@components': './src/components',
  '@screens': './src/screens',
  '@navigation': './src/navigation',
  '@services': './src/services',
  '@utils': './src/utils',
  '@constants': './src/constants',
  '@contexts': './src/contexts',
  '@assets': './assets',
};

// Enable tree shaking for better bundle optimization
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_keys: true,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  compress: {
    reduce_funcs: false,
  },
};

// Asset extensions
config.resolver.assetExts.push(
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Images
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
);

module.exports = config;