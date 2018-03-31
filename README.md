# aes-wasm

This library is a WASM port of the [ghostscript AES implementation](https://www.ghostscript.com/doc/base/aes.c).
Currently CBC and CTR mode are supported.

You can use this library like any other JS dependency in your project by running
```sh
npm i aes-wasm
```
or
```sh
yarn add aes-wasm
```

and importing it in the appropriate place in your project:
```
import { aes256 } from 'aes-wasm';
```

The WebAssembly code is inlined into a common JS bundle and compiled and executed on the fly.
A webpack build can handle this just fine, but the browser running your application has to [support](https://caniuse.com/#feat=wasm)
WebAssembly.

## Usage

This library has three exports - `aes128`, `aes192` and `aes256`.
All function exactly the same but use the three variants of AES with different key sizes under the hood which means
they have to be initialized with appropriate keys.

Each export of the module is a nullary function which returns a promise that resolves with an API object.
Calling this function initializes a new WebAssembly context.

```js
import { aes256 } from 'aes-wasm';

aes256().then(aesApi => {
    // encrypt and decrypt here
});
```

The API object has three functions for initialization, encryption and decryption:

### init(key, iv, mode = 'CBC')

Initializes the instance with a key and an IV. The `key` has to be a `TypedArray`, an `Array` or an array-like object
containing the byte values of the AES key (16 items for aes128, 24 items for aes192 and 32 items for aes256).

The `iv` has to be a `TypedArray`, an `Array` or an array-like object containing the byte values of the AES IV (16 items).

`mode` defines the encryption/decryption mode as `string` - supported values are `CBC` and `CTR`.

### encrypt(plainData): encryptedData

Encrypts a given set of data which has to be a `TypedArray`, an `Array` or an array-like object containing the byte values
of the data block. The size of the data block has to be divisble by 16 if the `CBC` mode is used (padding is not included yet).
A `TypedArray` will yield the best performance as it doesn't have to be converted prior to use.
Returns a `TypedArray` containing the encrypted data.

### decrypt(plainData): plainData

Decrypts a given set of encrypted data which has to be a `TypedArray`, an `Array` or an array-like object containing the byte values
of the data block. The size of the data block has to be divisble by 16 if the `CBC` mode is used (padding is not included yet).
A `TypedArray` will yield the best performance as it doesn't have to be converted prior to use.
Returns a `TypedArray` containing the decrypted data.