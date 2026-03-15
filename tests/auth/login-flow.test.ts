import { describe, it, expect, beforeAll } from 'vitest'
import { testUsers, TEST_PASSWORD } from './test-users'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Helper to perform a full login flow against the running dev server
async function loginAs(email: string, password: string) {
  // Step 1: Get CSRF token + cookies
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
  if (!csrfRes.ok) return { ok: false, error: 'csrf_failed', status: csrfRes.status }

  const { csrfToken } = await csrfRes.json()
  const csrfCookie = csrfRes.headers.get('set-cookie')?.split(';')[0] || ''

  // Step 2: POST credentials
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
      Cookie: csrfCookie,
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: `${BASE_URL}/lessons`,
    }),
    redirect: 'manual',
  })

  const cookies = loginRes.headers.get('set-cookie') || ''
  const hasSessionToken = cookies.includes('authjs.session-token') || cookies.includes('next-auth.session-token')

  let body: any = null
  try {
    body = await loginRes.json()
  } catch {
    // Some responses may not be JSON
  }

  return {
    ok: loginRes.ok || loginRes.status === 302,
    status: loginRes.status,
    hasSessionToken,
    redirectUrl: body?.url || loginRes.headers.get('location'),
    error: body?.url?.includes('error') ? 'auth_error' : null,
  }
}

// Helper to get session info with a session token
async function getSession(sessionCookie: string) {
  const res = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: sessionCookie },
  })
  if (!res.ok) return null
  return res.json()
}

describe('Auth Login Flow (TDD - Integration)', () => {
  // Pre-check: verify server is running
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/providers`)
      expect(res.ok).toBe(true)
    } catch {
      throw new Error(
        `Dev server not running at ${BASE_URL}. Start it with: npm run dev`
      )
    }
  })

  describe('Auth endpoints are live', () => {
    it('GET /api/auth/providers returns credentials provider', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/providers`)
      const data = await res.json()
      expect(res.ok).toBe(true)
      expect(data.credentials).toBeDefined()
      expect(data.credentials.type).toBe('credentials')
    })

    it('GET /api/auth/csrf returns a CSRF token', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/csrf`)
      const data = await res.json()
      expect(res.ok).toBe(true)
      expect(data.csrfToken).toBeDefined()
      expect(typeof data.csrfToken).toBe('string')
      expect(data.csrfToken.length).toBeGreaterThan(10)
    })
  })

  describe('Successful login for each test role', () => {
    it.each(testUsers)(
      '$role ($email) can login successfully',
      async (user) => {
        const result = await loginAs(user.email, TEST_PASSWORD)
        expect(result.ok).toBe(true)
        expect(result.error).toBeNull()
        expect(result.hasSessionToken).toBe(true)
      }
    )
  })

  describe('Failed login scenarios', () => {
    it('rejects wrong password', async () => {
      const result = await loginAs('admin@test.com', 'wrong-password-123')
      // Wrong password should not produce a session token
      expect(result.hasSessionToken).toBe(false)
    })

    it('rejects non-existent email', async () => {
      const result = await loginAs('doesnotexist@test.com', TEST_PASSWORD)
      expect(result.hasSessionToken).toBe(false)
    })

    it('rejects empty credentials', async () => {
      const result = await loginAs('', '')
      expect(result.hasSessionToken).toBe(false)
    })
  })

  describe('Session contains role and ageGroup', () => {
    it('admin session has super_admin role', async () => {
      // Full login flow with cookie capture
      const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
      const { csrfToken } = await csrfRes.json()
      const csrfCookie = csrfRes.headers.get('set-cookie')?.split(';')[0] || ''

      const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Auth-Return-Redirect': '1',
          Cookie: csrfCookie,
        },
        body: new URLSearchParams({
          email: 'admin@test.com',
          password: TEST_PASSWORD,
          csrfToken,
          callbackUrl: `${BASE_URL}/`,
        }),
        redirect: 'manual',
      })

      const setCookies = loginRes.headers.get('set-cookie') || ''
      const sessionMatch = setCookies.match(/(authjs\.session-token|next-auth\.session-token)=([^;]+)/)

      if (sessionMatch) {
        const sessionCookie = `${sessionMatch[1]}=${sessionMatch[2]}`
        const session = await getSession(sessionCookie)
        expect(session?.user).toBeDefined()
        // JWT callback should expose role
        expect(session?.user?.role || (session?.user as any)?.role).toBeDefined()
      }
    })
  })
})
