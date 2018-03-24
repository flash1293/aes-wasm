import { coerceArray } from "./utils";

function createEnv() {
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  const STACKTOP = 11312;
  const DYNAMICTOP_PTR = 11296;
  // set starting point for dynamic memory allocations
  (new Uint32Array(memory.buffer))[DYNAMICTOP_PTR >> 2] = 5254208;
  return {
    env: {
      memory: memory,
      DYNAMICTOP_PTR,
      STACKTOP,
      enlargeMemory: () => {
        throw new Error("growing the memory is not supported");
      },
      getTotalMemory: () => {
        return memory.buffer.byteLength;
      },
      _emscripten_memcpy_big: () => {
        throw new Error("growing the memory is not supported");
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

  const encryptionContextPointer = instance.exports._malloc(278);
  const decryptionContextPointer = instance.exports._malloc(278);
  const keyPointer = instance.exports._malloc(keySize);
  const ivPointer = instance.exports._malloc(16);

  let reservedSize = 2**12;
  let blockPointer = instance.exports._malloc(reservedSize);
  let currentMode = 'CBC';

  function loadData(data) {
    const byteData = coerceArray(data);
    if (byteData.length > reservedSize) {
      instance.exports._free(blockPointer);
      reservedSize = 2**Math.ceil(Math.log2(byteData.length));
      blockPointer = instance.exports._malloc(reservedSize);
    }
    byteView.set(byteData, blockPointer);
  }

  return {
    init: (key, iv, mode = 'CBC') => {
      currentMode = mode;
      byteView.set(iv, ivPointer);
      byteView.set(key, keyPointer);
      instance.exports._aes_setkey_enc(encryptionContextPointer, keyPointer, keySize);
      instance.exports._aes_setkey_dec(decryptionContextPointer, keyPointer, keySize);
    },
    encrypt: data => {
      loadData(data);
      instance.exports._aes_crypt_cbc(encryptionContextPointer, 1, data.length, ivPointer, blockPointer, blockPointer);
      return byteView.subarray(blockPointer, blockPointer + data.length).slice();
    },
    decrypt: data => {
      loadData(data);
      instance.exports._aes_crypt_cbc(decryptionContextPointer, 0, data.length, ivPointer, blockPointer, blockPointer);
      return byteView.subarray(blockPointer, blockPointer + data.length).slice();
    }
  };
};
