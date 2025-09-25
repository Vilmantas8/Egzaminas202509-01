// INTEGRATION TESTS SUITE - SPRINT 4 T040
// End-to-end testing for the Construction Equipment Rental System
// Tests critical user workflows and system functionality

const { test, expect } = require('@playwright/test');

// Test Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

// Test Users
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Test Admin'
  },
  user: {
    email: 'user@test.com', 
    password: 'user123',
    name: 'Test User'
  }
};

test.describe('Construction Equipment Rental System - Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  // ===== AUTHENTICATION WORKFLOW TESTS =====
  
  test.describe('Authentication Flow', () => {
    
    test('should complete user registration workflow', async ({ page }) => {
      // Navigate to registration
      await page.click('a[href="/register"]');
      await page.waitForURL('**/register');
      
      // Fill registration form
      const timestamp = Date.now();
      const testUser = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'testpassword123'
      };
      
      await page.fill('input[name="name"]', testUser.name);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      
      // Submit registration
      await page.click('button[type="submit"]');
      
      // Should redirect to home page after successful registration
      await page.waitForURL(BASE_URL);
      
      // Should show success notification
      await expect(page.locator('.notification-item')).toContainText('sėkmingai');
      
      // Should show user name in navigation
      await expect(page.locator('.navbar')).toContainText(testUser.name);
    });
  });

  // ===== EQUIPMENT BROWSING TESTS =====
  
  test.describe('Equipment Browsing', () => {
    
    test('should browse equipment without login', async ({ page }) => {
      // Navigate to equipment page
      await page.click('a[href="/equipment"]');
      await page.waitForURL('**/equipment');
      
      // Should show equipment grid
      await expect(page.locator('.equipment-page')).toBeVisible();
      
      // Should show equipment cards
      const equipmentCards = page.locator('.card');
      await expect(equipmentCards).toHaveCountGreaterThan(0);
      
      // Should show equipment names
      await expect(equipmentCards.first()).toContainText('€');
    });
  });

  // ===== RESPONSIVE DESIGN TESTS =====
  
  test.describe('Responsive Design', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(BASE_URL);
      
      // Should show mobile navigation
      await expect(page.locator('.navbar-toggler')).toBeVisible();
      
      // Test equipment page on mobile
      await page.goto(`${BASE_URL}/equipment`);
      await expect(page.locator('.equipment-page')).toBeVisible();
    });
  });
});

module.exports = { TEST_USERS };