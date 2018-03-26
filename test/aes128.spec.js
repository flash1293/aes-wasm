import { coerceArray } from '../src/utils';
import aes128 from '../src/aes128';

describe('aes128', () => {

  it('should initialize', async () => {
    await aes128();
  });

  describe('CBC', () => {
    const plainBuffer = coerceArray([0x6b, 0xc1, 0xbe, 0xe2, 0x2e, 0x40, 0x9f, 0x96, 0xe9, 0x3d, 0x7e, 0x11, 0x73, 0x93, 0x17, 0x2a,
      0xae, 0x2d, 0x8a, 0x57, 0x1e, 0x03, 0xac, 0x9c, 0x9e, 0xb7, 0x6f, 0xac, 0x45, 0xaf, 0x8e, 0x51,
      0x30, 0xc8, 0x1c, 0x46, 0xa3, 0x5c, 0xe4, 0x11, 0xe5, 0xfb, 0xc1, 0x19, 0x1a, 0x0a, 0x52, 0xef,
      0xf6, 0x9f, 0x24, 0x45, 0xdf, 0x4f, 0x9b, 0x17, 0xad, 0x2b, 0x41, 0x7b, 0xe6, 0x6c, 0x37, 0x10]);
    const encryptedBuffer = coerceArray([0x76, 0x49, 0xab, 0xac, 0x81, 0x19, 0xb2, 0x46, 0xce, 0xe9, 0x8e, 0x9b, 0x12, 0xe9, 0x19, 0x7d,
      0x50, 0x86, 0xcb, 0x9b, 0x50, 0x72, 0x19, 0xee, 0x95, 0xdb, 0x11, 0x3a, 0x91, 0x76, 0x78, 0xb2,
      0x73, 0xbe, 0xd6, 0xb8, 0xe3, 0xc1, 0x74, 0x3b, 0x71, 0x16, 0xe6, 0x9e, 0x22, 0x22, 0x95, 0x16,
      0x3f, 0xf1, 0xca, 0xa1, 0x68, 0x1f, 0xac, 0x09, 0x12, 0x0e, 0xca, 0x30, 0x75, 0x86, 0xe1, 0xa7
    ]);
    const ivBuffer = coerceArray([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const keyBuffer = coerceArray([0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]);

    it('should encrypt CBC correctly', async () => {
      const crypt = await aes128();
      crypt.init(keyBuffer, ivBuffer);
      const result = crypt.encrypt(plainBuffer);
      expect(result).toEqual(encryptedBuffer);
    });

    it('should decrypt CBC correctly', async () => {
      const crypt = await aes128();
      crypt.init(keyBuffer, ivBuffer);
      const result = crypt.decrypt(encryptedBuffer);
      expect(result).toEqual(plainBuffer);
    });

    it('should handle large arrays correctly', async () => {
      let crypt = await aes128();
      crypt.init(keyBuffer, ivBuffer);
      const size = 2**20;
      const largePlainBuffer = new Uint8Array(size);
      for(let i = 0; i < size; i++) {
        largePlainBuffer[i] = i % 256;
      }
      const largeEncryptedBuffer = crypt.encrypt(largePlainBuffer);
      crypt.init(keyBuffer, ivBuffer);
      const largeDecryptedBuffer = crypt.decrypt(largeEncryptedBuffer);
      expect(largeDecryptedBuffer).toEqual(largePlainBuffer);
    });
  });
});
