import glue from './glue';
import wasmModule from './wasm/aes.wasm';

export default glue(wasmModule, 128);