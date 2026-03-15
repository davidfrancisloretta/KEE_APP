import { describe, it, expect } from 'vitest'
import { testUsers } from './test-users'

// TDD: Define role-based access rules FIRST, then implement
const adminRoles = ['content_admin', 'super_admin', 'reviewer'] as const
const dashboardRoles = ['parent', 'teacher'] as const
const allRoles = ['child', 'parent', 'teacher', 'content_admin', 'super_admin', 'reviewer'] as const

describe('Role-Based Access Control (TDD - Unit)', () => {
  describe('Admin access rules', () => {
    it.each(
      testUsers.filter(u => adminRoles.includes(u.role as any))
    )('$role ($email) should have admin access', (user) => {
      expect(adminRoles).toContain(user.role)
      expect(user.expectedNav).toContain('admin')
    })

    it.each(
      testUsers.filter(u => !adminRoles.includes(u.role as any))
    )('$role ($email) should NOT have admin access', (user) => {
      expect(adminRoles).not.toContain(user.role)
      expect(user.expectedNav).not.toContain('admin')
    })
  })

  describe('Role enum validation', () => {
    it('should only contain valid roles', () => {
      for (const user of testUsers) {
        expect(allRoles).toContain(user.role)
      }
    })

    it('should have exactly 8 test users covering all roles', () => {
      expect(testUsers).toHaveLength(8)
      const roles = new Set(testUsers.map(u => u.role))
      expect(roles.size).toBe(allRoles.length)
    })
  })

  describe('Age group assignment', () => {
    it('child users must have an age group', () => {
      const children = testUsers.filter(u => u.role === 'child')
      for (const child of children) {
        expect(child.ageGroup).toBeTruthy()
        expect(['little-explorers', 'junior-scholars', 'young-disciples']).toContain(child.ageGroup)
      }
    })

    it('non-child users should not have an age group', () => {
      const nonChildren = testUsers.filter(u => u.role !== 'child')
      for (const user of nonChildren) {
        expect(user.ageGroup).toBeNull()
      }
    })

    it('should cover all 3 age groups', () => {
      const ageGroups = testUsers
        .filter(u => u.ageGroup !== null)
        .map(u => u.ageGroup)
      expect(new Set(ageGroups).size).toBe(3)
    })
  })

  describe('Navigation visibility', () => {
    it('admin nav item visible only for admin roles', () => {
      for (const user of testUsers) {
        const isAdmin = adminRoles.includes(user.role as any)
        const hasAdminNav = user.expectedNav.includes('admin')
        expect(hasAdminNav).toBe(isAdmin)
      }
    })
  })
})
