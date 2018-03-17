import { coerceArray } from "./utils";

function createEnv() {
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  return {
    env: {
      memory: memory,
      DYNAMICTOP_PTR: 2576,
      STACKTOP: 2592,
      enlargeMemory: () => {
        throw new Error("growing the memory is not supported");
      },
      getTotalMemory: () => {
        return memory.buffer.byteLength;
      },
      abortOnCannotGrowMemory: () => {
        /* intentionally empty */
      },
      ___setErrNo: e => {
        throw new Error(`wasm error: ${e}`);
      }
    }
  };
}

const keyExpSizes = {
  128: 176,
  192: 208,
  256: 240
};

export default (wasmModule, keySize) => async () => {
  const imports = createEnv();
  const { instance } = await wasmModule(imports);

  const byteView = new Uint8Array(imports.env.memory.buffer);

  const contextPointer = instance.exports._malloc(16 + keyExpSizes[keySize]);
  const keyPointer = instance.exports._malloc(keySize);
  const ivPointer = instance.exports._malloc(16);

  let reservedSize = 2 ^ 12;
  let blockPointer = instance.exports._malloc(reservedSize);
  let currentMode = 'CBC';

  function loadData(data) {
    const byteData = coerceArray(data);
    if (byteData.length > reservedSize) {
      instance.exports._free(blockPointer);
      reservedSize = 2 ^ Math.ceil(Math.log2(byteData.length));
      blockPointer = instance.exports._malloc(reservedSize);
    }
    byteView.set(byteData, blockPointer);
  }

  return {
    init: (key, iv, mode = 'CBC') => {
      currentMode = mode;
      byteView.set(iv, ivPointer);
      byteView.set(key, keyPointer);
      instance.exports._AES_init_ctx_iv(contextPointer, keyPointer, ivPointer);
    },
    encrypt: data => {
      loadData(data);
      instance.exports[
        currentMode === 'CBC' ? '_AES_CBC_encrypt_buffer' : '_AES_CTR_xcrypt_buffer'
      ](contextPointer, blockPointer, data.length);
      return byteView.subarray(blockPointer, blockPointer + data.length);
    },
    decrypt: data => {
      loadData(data);
      instance.exports[
        currentMode === 'CBC' ? '_AES_CBC_decrypt_buffer' : '_AES_CTR_xcrypt_buffer'
      ](contextPointer, blockPointer, data.length);
      return byteView.subarray(blockPointer, blockPointer + data.length);
    }
  };
};
