import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// TDD: Define the registration schema validation rules
// These tests verify the validation logic without hitting the database

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['child', 'parent', 'teacher']).default('child'),
  ageGroup: z
    .enum(['little-explorers', 'junior-scholars', 'young-disciples'])
    .optional(),
})

describe('Registration Validation (TDD - Unit)', () => {
  it('accepts valid child registration', () => {
    const result = registerSchema.safeParse({
      email: 'newchild@test.com',
      password: 'securepass123',
      name: 'Test Child',
      role: 'child',
      ageGroup: 'little-explorers',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid parent registration', () => {
    const result = registerSchema.safeParse({
      email: 'newparent@test.com',
      password: 'securepass123',
      name: 'Test Parent',
      role: 'parent',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid teacher registration', () => {
    const result = registerSchema.safeParse({
      email: 'newteacher@test.com',
      password: 'securepass123',
      name: 'Test Teacher',
      role: 'teacher',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
      name: 'Test',
      role: 'child',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password (< 8 chars)', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: '1234567',
      name: 'Test',
      role: 'child',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'securepass123',
      name: '',
      role: 'child',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'securepass123',
      name: 'Test',
      role: 'super_admin', // Not allowed via registration
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid age group', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'securepass123',
      name: 'Test',
      role: 'child',
      ageGroup: 'invalid-group',
    })
    expect(result.success).toBe(false)
  })

  it('defaults role to child when omitted', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'securepass123',
      name: 'Test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('child')
    }
  })
})
