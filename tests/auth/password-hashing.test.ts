import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'
import { TEST_PASSWORD } from './test-users'

describe('Password Hashing (TDD - Unit)', () => {
  it('should hash a password with bcrypt', async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 12)
    expect(hash).toBeDefined()
    expect(hash).not.toBe(TEST_PASSWORD)
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true)
  })

  it('should verify correct password against hash', async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 12)
    const valid = await bcrypt.compare(TEST_PASSWORD, hash)
    expect(valid).toBe(true)
  })

  it('should reject wrong password against hash', async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 12)
    const valid = await bcrypt.compare('wrongpassword', hash)
    expect(valid).toBe(false)
  })

  it('should produce different hashes for same password (salt)', async () => {
    const hash1 = await bcrypt.hash(TEST_PASSWORD, 12)
    const hash2 = await bcrypt.hash(TEST_PASSWORD, 12)
    expect(hash1).not.toBe(hash2)
    // Both should still validate
    expect(await bcrypt.compare(TEST_PASSWORD, hash1)).toBe(true)
    expect(await bcrypt.compare(TEST_PASSWORD, hash2)).toBe(true)
  })

  it('should reject empty password', async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 12)
    const valid = await bcrypt.compare('', hash)
    expect(valid).toBe(false)
  })
})
