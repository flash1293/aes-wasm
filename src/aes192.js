import wasmModule from './wasm/aes192.wasm';
import glue from './glue';

export default glue(192)(wasmModule);