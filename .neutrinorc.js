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
        .use('binary-loader')
        .loader('binary-loader');
    },
    [
      '@neutrinojs/jest',
      {
        transform: {
          "wasm$":
            "<rootDir>/test/binaryLoader.js"
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
