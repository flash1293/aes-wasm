#!/bin/sh

rm -rf src/wasm
mkdir src/wasm

emcc ./c/aes.c \
    -s WASM=1 \
    -O3 \
    -s "EXPORTED_FUNCTIONS=['_aes_setkey_dec', '_aes_setkey_enc', '_aes_crypt_cbc', '_aes_crypt_ctr']" \
    -o src/wasm/aes.js