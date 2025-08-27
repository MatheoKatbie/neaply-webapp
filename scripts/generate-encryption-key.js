const crypto = require('crypto')

// Générer une clé de chiffrement sécurisée de 32 caractères
const encryptionKey = crypto.randomBytes(32).toString('base64')

console.log('🔐 Generated Encryption Key:')
console.log('=====================================')
console.log('')
console.log('Add this to your environment variables:')
console.log('')
console.log(`ENCRYPTION_KEY=${encryptionKey}`)
console.log('')
console.log('⚠️  Important:')
console.log('- Keep this key secret and secure')
console.log('- Use the same key across all environments')
console.log('- Never commit this key to version control')
console.log('- If you change this key, existing encrypted data will not be decryptable')
