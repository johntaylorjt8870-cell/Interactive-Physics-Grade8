const PASSWORD_SALT = 'yTThtxa5TYE40TX6LcpWghxG';
const PASSWORD_DERIVED_KEY = '2069af38a374c2af211e05a30a7549bfa4fc09985886f07c99edbbe7829e3abc';
const PASSWORD_ITERATIONS = 180_000;

function bytesFromHex(hex) {
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));
}

/**
 * Verifies a teacher passphrase without storing its plain-text form in the app.
 * Web Crypto is required; the static-page gate is not server-side authorization.
 */
export async function verifyTeacherPassword(candidate) {
  if (typeof candidate !== 'string') return false;
  if (!globalThis.crypto?.subtle) {
    throw new Error('secure-context-required');
  }

  const encoder = new TextEncoder();
  const importedKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(candidate),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(PASSWORD_SALT),
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256',
    },
    importedKey,
    256,
  );

  const actual = new Uint8Array(derivedBits);
  const expected = bytesFromHex(PASSWORD_DERIVED_KEY);
  if (actual.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }
  return difference === 0;
}
