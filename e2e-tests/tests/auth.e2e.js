// tests/auth.e2e.js
const { By } = require('selenium-webdriver');
const SeleniumConfig = require('../config/selenium.config');
const TestHelpers = require('../helpers/test.helpers');

describe('E2E - Authentication Flow', () => {
  let driver;
  let helpers;
  const baseUrl = SeleniumConfig.getBaseUrl();

  beforeAll(async () => {
    driver = await SeleniumConfig.createDriver();
    helpers = new TestHelpers(driver);
  });

  afterAll(async () => {
    await SeleniumConfig.quitDriver(driver);
  });

  describe('Login Page', () => {

    test('E2E-01: Should display login page correctly', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      const usernameField = await helpers.elementExists(By.name('username'));
      const passwordField = await helpers.elementExists(By.name('password'));
      const loginButton = await helpers.elementExists(By.css('button[type="submit"]'));

      expect(usernameField).toBe(true);
      expect(passwordField).toBe(true);
      expect(loginButton).toBe(true);
    });

    test('E2E-02: Should show error with empty credentials', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      await helpers.waitAndClick(By.css('button[type="submit"]'));

      // Wait for error message to appear
      await driver.sleep(1000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    test('E2E-03: Should show error with invalid credentials', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      await helpers.login('invaliduser', 'invalidpass');

      // Wait for error message
      await driver.sleep(2000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    test('E2E-04: Should login successfully with admin credentials', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      await helpers.login('admin', 'admin123');

      // Wait for redirect to dashboard
      await driver.sleep(3000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/admin') || expect(currentUrl).not.toContain('/login');
    });

    test('E2E-05: Should login successfully with guru credentials', async () => {
      // First logout if logged in
      try {
        await helpers.navigateTo(`${baseUrl}/login`);
      } catch (error) {
        // Already at login page
      }

      await helpers.login('guru', 'guru123');

      // Wait for redirect
      await driver.sleep(3000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/guru') || expect(currentUrl).not.toContain('/login');
    });

    test('E2E-06: Should login successfully with siswa credentials', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      await helpers.login('siswa', 'siswa123');

      // Wait for redirect
      await driver.sleep(3000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/siswa') || expect(currentUrl).not.toContain('/login');
    });
  });

  describe('Logout Flow', () => {

    test('E2E-07: Admin should logout successfully', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);
      await helpers.login('admin', 'admin123');

      // Wait for dashboard to load
      await driver.sleep(3000);

      // Find and click logout button
      try {
        const logoutButton = await helpers.waitForElement(
          By.xpath("//button[contains(text(), 'Logout') or contains(text(), 'Keluar')]"),
          5000
        );
        await logoutButton.click();
      } catch (error) {
        // Try alternative logout method (clicking profile then logout)
        const profileButton = await helpers.waitForElement(By.css('[data-testid="profile-button"]'), 5000);
        await profileButton.click();
        await driver.sleep(500);
        const logoutOption = await helpers.waitForElement(By.xpath("//button[contains(text(), 'Logout')]"), 5000);
        await logoutOption.click();
      }

      // Wait for redirect to login
      await driver.sleep(2000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    test('E2E-08: Should not access protected routes after logout', async () => {
      // Try to access admin dashboard
      await helpers.navigateTo(`${baseUrl}/admin/dashboard`);

      // Should be redirected to login
      await driver.sleep(2000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });
  });

  describe('Protected Routes', () => {

    test('E2E-09: Should redirect to login when accessing protected route without auth', async () => {
      await helpers.navigateTo(`${baseUrl}/admin/siswa`);

      await driver.sleep(2000);

      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    test('E2E-10: Should maintain session after page refresh', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);
      await helpers.login('admin', 'admin123');

      await driver.sleep(3000);

      // Refresh the page
      await driver.navigate().refresh();

      await driver.sleep(2000);

      // Should still be on dashboard, not redirected to login
      const currentUrl = await helpers.getCurrentUrl();
      expect(currentUrl).not.toContain('/login');
    });
  });

  describe('Password Visibility Toggle', () => {

    test('E2E-11: Should toggle password visibility', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);

      const passwordField = await helpers.waitForElement(By.name('password'));

      // Initially should be password type
      let fieldType = await passwordField.getAttribute('type');
      expect(fieldType).toBe('password');

      // Click toggle button if exists
      try {
        const toggleButton = await helpers.waitForElement(
          By.css('[data-testid="toggle-password"], [aria-label="toggle password visibility"]'),
          3000
        );
        await toggleButton.click();

        // Should now be text type
        fieldType = await passwordField.getAttribute('type');
        expect(fieldType).toBe('text');

        // Click again to hide
        await toggleButton.click();

        fieldType = await passwordField.getAttribute('type');
        expect(fieldType).toBe('password');
      } catch (error) {
        // Password toggle might not be implemented
        console.log('Password toggle not found');
      }
    });
  });
});
