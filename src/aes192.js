import wasmModule from './wasm/aes.wasm';
import glue from './glue';

export default glue(wasmModule, 192);