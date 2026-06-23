module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta lets wagmi/viem (which use import.meta) run under Metro
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
      '@babel/preset-typescript',
    ],
  };
};
