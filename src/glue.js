import { coerceArray } from "./utils.js";

function createEnv() {
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  const STACKTOP = 0;
  return {
    env: {
      memory: memory,
      STACKTOP
    }
  };
}

function staticMalloc() {
  let pointer = 2**14;
  return (size) => {
    pointer += size;
    return pointer - size;
  }
}

export default (wasmModule, keySize) => () => {
  const malloc = staticMalloc();

  const imports = createEnv();
  return wasmModule(imports)
    .then(({ instance }) => {
      const byteView = new Uint8Array(imports.env.memory.buffer);

      const encryptionContextPointer = malloc(276);
      const decryptionContextPointer = malloc(276);
      const keyPointer = malloc(keySize / 8);
      const ivPointer = malloc(16);
      // rest of the memory
      const blockPointer = malloc(0);

      let currentMode;

      function loadData(data) {
        const byteData = coerceArray(data);
        byteView.set(byteData, blockPointer);
      }

      return {
        init: (key, iv, mode = 'CBC') => {
          byteView.set(iv, ivPointer);
          byteView.set(key, keyPointer);
          instance.exports._aes_setkey_enc(encryptionContextPointer, keyPointer, keySize);
          instance.exports._aes_setkey_dec(decryptionContextPointer, keyPointer, keySize);
          currentMode = mode;
        },
        encrypt: data => {
          loadData(data);
          if(currentMode === 'CBC') {
            instance.exports._aes_crypt_cbc(encryptionContextPointer, 1, data.length, ivPointer, blockPointer, blockPointer);
          } else {
            instance.exports._aes_crypt_ctr(encryptionContextPointer, data.length, ivPointer, blockPointer, blockPointer);
          }

          return byteView.subarray(blockPointer, blockPointer + data.length).slice();
        },
        decrypt: data => {
          loadData(data);
          if(currentMode === 'CBC') {
            instance.exports._aes_crypt_cbc(decryptionContextPointer, 0, data.length, ivPointer, blockPointer, blockPointer);
          } else {
            instance.exports._aes_crypt_ctr(encryptionContextPointer, data.length, ivPointer, blockPointer, blockPointer);
          }
          return byteView.subarray(blockPointer, blockPointer + data.length).slice();
        }
      };
    });
};

