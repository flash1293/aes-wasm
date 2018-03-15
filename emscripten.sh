#!/bin/sh

function build {
    # set flags
    sed -i -e "s/#define AES128 1/\/\/#define AES128 1/g" ./tiny-AES-c/aes.h
    sed -i -e "s/\/\/#define AES$1 1/#define AES$1 1/g" ./tiny-AES-c/aes.h

    # compile wasm
    emcc ./tiny-AES-c/aes.c \
        -s WASM=1 \
        -O3 \
        -s "EXPORTED_FUNCTIONS=['_AES_init_ctx_iv', '_AES_CTR_xcrypt_buffer', '_AES_CBC_encrypt_buffer', '_AES_CBC_decrypt_buffer', '_malloc', '_free']" \
        -o src/wasm/aes$1.js
    
    # clean up 
    rm src/wasm/aes$1.js
    sed -i -e "s/#define AES$1 1/\/\/#define AES$1 1/g" ./tiny-AES-c/aes.h
    sed -i -e "s/\/\/#define AES128 1/#define AES128 1/g" ./tiny-AES-c/aes.h
}

rm -rf src/wasm
mkdir src/wasm

build 128
build 192
build 256