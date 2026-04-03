import * as crypto from 'crypto';

// Encryption key (in production, this should be stored in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'playwright-test-secret-key-2024!';

// Normalize key to 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

export function encryptCredentials(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (both hex)
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptCredentials(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Store encrypted credentials
export const CREDENTIALS = {
  username: encryptCredentials('standard_user'),
  password: encryptCredentials('secret_sauce'),
};

// Export decrypted credentials for use in tests
export const getCredentials = () => ({
  username: decryptCredentials(CREDENTIALS.username),
  password: decryptCredentials(CREDENTIALS.password),
});
