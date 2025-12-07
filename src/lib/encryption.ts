import crypto from 'crypto'

// Encryption key should be stored in environment variables
// CRITICAL: Encryption key MUST be set in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('FATAL: ENCRYPTION_KEY must be set in environment variables. Generate one with: openssl rand -hex 32')
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('FATAL: ENCRYPTION_KEY must be exactly 64 characters (32 bytes in hex). Generate one with: openssl rand -hex 32')
}

// After validation, we know ENCRYPTION_KEY is defined and valid
const VALIDATED_ENCRYPTION_KEY: string = ENCRYPTION_KEY
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

/**
 * Encrypts JSON content for secure storage in database
 * @param jsonContent - The JSON content to encrypt
 * @returns Encrypted string (base64 encoded)
 */
export function encryptJsonContent(jsonContent: any): string {
  try {
    // Convert JSON to string if it's an object
    const jsonString = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent)

    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher using the new API
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(VALIDATED_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv)
    cipher.setAAD(Buffer.from('workflow-json', 'utf8'))

    // Encrypt the data
    let encrypted = cipher.update(jsonString, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get the auth tag
    const tag = cipher.getAuthTag()

    // Combine IV, encrypted data, and auth tag
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), tag])

    // Return as base64
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt JSON content')
  }
}

/**
 * Decrypts JSON content from database
 * @param encryptedContent - The encrypted content (base64 encoded)
 * @returns The original JSON content
 */
export function decryptJsonContent(encryptedContent: string): any {
  try {
    // Decode from base64
    const combined = Buffer.from(encryptedContent, 'base64')

    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH)
    const tag = combined.subarray(combined.length - TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH)

    // Create decipher using the new API
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(VALIDATED_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv)
    decipher.setAAD(Buffer.from('workflow-json', 'utf8'))
    decipher.setAuthTag(tag)

    // Decrypt the data
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    // Try to parse as JSON, return as string if it fails
    try {
      return JSON.parse(decrypted)
    } catch {
      return decrypted
    }
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt JSON content')
  }
}

/**
 * Checks if content is encrypted
 * @param content - The content to check
 * @returns True if content appears to be encrypted
 */
export function isEncrypted(content: any): boolean {
  if (typeof content !== 'string') return false

  try {
    // Try to decode as base64 and check if it has the right structure
    const decoded = Buffer.from(content, 'base64')
    return decoded.length >= IV_LENGTH + TAG_LENGTH
  } catch {
    return false
  }
}

/**
 * Safely encrypt content only if it's not already encrypted
 * @param content - The content to encrypt
 * @returns Encrypted content or original content if already encrypted
 */
export function safeEncrypt(content: any): string {
  if (isEncrypted(content)) {
    return content
  }
  return encryptJsonContent(content)
}

/**
 * Safely decrypt content only if it's encrypted
 * @param content - The content to decrypt
 * @returns Decrypted content or original content if not encrypted
 */
export function safeDecrypt(content: any): any {
  if (isEncrypted(content)) {
    return decryptJsonContent(content)
  }
  return content
}
