// https://github.com/ricmoo/aes-js

function checkInt(value) {
  return parseInt(value) === value;
}

function checkInts(arrayish) {
  if (!checkInt(arrayish.length)) {
    return false;
  }

  for (var i = 0; i < arrayish.length; i++) {
    if (!checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
      return false;
    }
  }

  return true;
}

export function coerceArray(arg, copy) {
  // ArrayBuffer view
  if (arg.buffer && ArrayBuffer.isView(arg)) {
    if (copy) {
      if (arg.slice) {
        arg = arg.slice();
      } else {
        arg = Array.prototype.slice.call(arg);
      }
    }

    return arg;
  }

  // It's an array; check it is a valid representation of a byte
  if (Array.isArray(arg)) {
    if (!checkInts(arg)) {
      throw new Error("Array contains invalid value: " + arg);
    }

    return new Uint8Array(arg);
  }

  // Something else, but behaves like an array (maybe a Buffer? Arguments?)
  if (checkInt(arg.length) && checkInts(arg)) {
    return new Uint8Array(arg);
  }

  throw new Error("unsupported array-like object");
}