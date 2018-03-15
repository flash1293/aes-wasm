import glue from './glue';

const wasmModule = require('./wasm/aes128.wasm');
throw new Error(wasmModule.length);

export default glue(128)(wasmModule);