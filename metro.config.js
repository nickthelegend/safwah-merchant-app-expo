// Metro config tuned for the web3 stack (Reown AppKit / wagmi / viem).
// Ported from molfi-expo-app: resolve .mjs sources and prefer browser/main fields
// so the wallet libraries resolve correctly under Metro.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');
config.resolver.resolverMainFields.unshift('sbmodern', 'browser', 'main');

module.exports = config;
