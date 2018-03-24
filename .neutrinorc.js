module.exports = {
  use: [
    [
      '@neutrinojs/library',
      {
        name: 'tiny-aes-wasm',
      }
    ],
    (neutrino) => {
      neutrino.config.module
        .rule('compile')
        .test(/\.wasm$/)
        .use('wasm-loader')
        .loader('wasm-loader');
    },
    [
      '@neutrinojs/jest',
      {
        transform: {
          "wasm$":
            "<rootDir>/test/wasmLoader.js"
        }
      }
    ]
  ]
};
