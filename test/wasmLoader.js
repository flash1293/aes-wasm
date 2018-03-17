const fs = require('fs');
const wasmLoader = require('wasm-loader');

module.exports = {
  process(src, filename, config, options) {
    const content = fs.readFileSync(filename);

    let out;
    // use webpack wasm-loader for test cases
    wasmLoader.apply({ resourceQuery: '', callback: (_, data) => out = data }, [content]);

    return out;
  },
};