// Shared test user fixtures for all auth tests
export const TEST_PASSWORD = 'test1234'

export const testUsers = [
  { email: 'admin@test.com',    name: 'Admin User',      role: 'super_admin',   ageGroup: null,               expectedNav: ['admin'] },
  { email: 'content@test.com',  name: 'Content Admin',   role: 'content_admin', ageGroup: null,               expectedNav: ['admin'] },
  { email: 'reviewer@test.com', name: 'Reviewer',        role: 'reviewer',      ageGroup: null,               expectedNav: ['admin'] },
  { email: 'teacher@test.com',  name: 'Teacher User',    role: 'teacher',       ageGroup: null,               expectedNav: [] },
  { email: 'parent@test.com',   name: 'Parent User',     role: 'parent',        ageGroup: null,               expectedNav: [] },
  { email: 'child1@test.com',   name: 'Little Explorer', role: 'child',         ageGroup: 'little-explorers', expectedNav: [] },
  { email: 'child2@test.com',   name: 'Junior Scholar',  role: 'child',         ageGroup: 'junior-scholars',  expectedNav: [] },
  { email: 'child3@test.com',   name: 'Young Disciple',  role: 'child',         ageGroup: 'young-disciples',  expectedNav: [] },
] as const

export type TestUser = (typeof testUsers)[number]
