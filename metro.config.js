const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

// Ensure proper handling of React Native modules
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;