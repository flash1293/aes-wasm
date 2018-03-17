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
  ],
  options: {
    mains: {
      index: 'index',
      128: 'aes128',
      192: 'aes192',
      256: 'aes256'
    }
  }
};
