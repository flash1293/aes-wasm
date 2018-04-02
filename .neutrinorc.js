module.exports = {
  use: [
    [
      '@neutrinojs/library',
      {
        name: 'aes-wasm',
        babel: {
          // Override options for babel-preset-env
          presets: [
            ['env', {
            }]
          ]
        }
      }
    ],
    (neutrino) => {
      neutrino.config.module
        .rule('compile')
        .test(/\.wasm$/)
        .use('wasm-loader')
        .loader('@flash1293/wasm-loader');
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
