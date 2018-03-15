import wasmModule from './wasm/aes256.wasm';
import glue from './glue';

export default glue(256)(wasmModule);
