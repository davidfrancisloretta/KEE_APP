# Security Authority

## Children's Data Protection

ScriptureQuest handles data for minors (ages 4-14). Extra care is required.

### COPPA Compliance Principles
- Minimal data collection — only what's needed for the learning experience
- Parental consent required for accounts under 13
- No targeted advertising, no data selling
- Clear privacy policy in simple language
- Parent can review/delete child data at any time

## Authentication & Authorization

### Auth.js v5 Configuration
- JWT session strategy (stateless)
- Secure cookies: `HttpOnly`, `Secure`, `SameSite=Lax`
- Session expiry: 7 days, sliding window
- Password requirements: 8+ chars (don't over-burden, these are often parents)

### Role-Based Access Control (RBAC)
```
student  → lessons, quizzes, own progress
parent   → own children's data, progress reports
teacher  → class data, content review
admin    → everything
```

- Check roles server-side in tRPC procedures
- Never trust client-side role checks alone
- Use `protectedProcedure` for all authenticated endpoints

## Input Validation

- **All tRPC inputs**: validated with Zod schemas
- **File uploads**: validate type (DOCX/PDF only), size limit (50MB)
- **User content**: sanitize HTML, prevent XSS
- **SQL injection**: prevented by Drizzle ORM parameterized queries
- **Path traversal**: validate file paths in content parser

## API Security

- Rate limiting on auth endpoints (login, register)
- CSRF protection via Auth.js built-in
- No sensitive data in URL parameters
- Error messages: generic to users, detailed in logs
- No stack traces in production responses

## Environment Variables

- `.env` is gitignored
- `.env.example` documents required vars (no secrets)
- `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` required
- Never commit API keys, tokens, or secrets

## Content Security

- Uploaded content scanned before processing
- Content review workflow before publishing
- No executable files accepted
- Image URLs: only from allowed domains (next.config.js `images.remotePatterns`)

## Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```
