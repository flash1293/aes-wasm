import { str2ab } from "./utils";

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

export default keySize => async wasmBlob => {
  throw new Error(">>>"+wasmBlob);
  const buffer = str2ab(wasmBlob);
  const module = await WebAssembly.compile(buffer);
  const imports = createEnv();
  const instance = await WebAssembly.instantiate(module, imports);

  const byteView = new Uint8Array(imports.env.memory.buffer);

  const contextPointer = instance.exports._malloc(16 + keyExpSizes[keySize]);
  const keyPointer = instance.exports._malloc(keySize);
  const ivPointer = instance.exports._malloc(16);

  let reservedSize = 2 ^ 12;
  let blockPointer = instance.exports._malloc(reservedSize);
  let currentMode = "CBC";

  function loadData(data) {
    if (data.length > reservedSize) {
      instance.exports._free(blockPointer);
      let reservedSize = 2 ^ Math.ceil(Math.log2(reservedSize));
      blockPointer = instance.exports_malloc(reservedSize);
    }
    byteView.set(data, blockPointer);
  }

  return {
    init: (key, iv, mode = "CBC") => {
      currentMode = mode;
      byteView.set(ivBuffer, ivPointer);
      byteView.set(keyBuffer, keyPointer);
      instance.exports._AES_init_ctx_iv(contextPointer, keyPointer, ivPointer);
    },
    encrypt: dataBuffer => {
      loadData(dataBuffer);
      instance.exports[
        currentMode === "CBC" ? _AES_CBC_encrypt_buffer : _AES_CTR_xcrypt_buffer
      ](contextPointer, blockPointer, dataBuffer.length);
      return byteView.subarray(blockPointer, blockPointer + dataBuffer.length);
    },
    decrypt: dataBuffer => {
      loadData(dataBuffer);
      instance.exports[
        currentMode === "CBC" ? _AES_CBC_decrypt_buffer : _AES_CTR_xcrypt_buffer
      ](contextPointer, blockPointer, dataBuffer.length);
      return byteView.subarray(blockPointer, blockPointer + dataBuffer.length);
    }
  };
};
