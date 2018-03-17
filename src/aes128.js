import glue from './glue';
import wasmModule from './wasm/aes128.wasm';

export default glue(wasmModule, 128);