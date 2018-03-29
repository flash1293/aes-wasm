const fs = require('fs');
const wasmLoader = require('@flash1293/wasm-loader');

module.exports = {
  process(src, filename, config, options) {
    const content = fs.readFileSync(filename);

    let out;
    // use webpack wasm-loader for test cases
    wasmLoader.apply({ resourceQuery: '', callback: (_, data) => out = data }, [content]);

    return out;
  },
};