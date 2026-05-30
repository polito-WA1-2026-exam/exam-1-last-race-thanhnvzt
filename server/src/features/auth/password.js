import { scrypt } from 'node:crypto';
import { timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export async function verifyPassword(password, salt, expectedHash) {
  const computedHash = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (computedHash.length !== expected.length) return false;
  return timingSafeEqual(computedHash, expected);
}
