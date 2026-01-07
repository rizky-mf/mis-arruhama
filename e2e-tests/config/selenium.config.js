// config/selenium.config.js
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class SeleniumConfig {
  static async createDriver() {
    const options = new chrome.Options();

    // Add Chrome options for better performance and stability
    options.addArguments('--start-maximized');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-gpu');

    // Uncomment the line below to run tests in headless mode
    // options.addArguments('--headless');

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Set implicit wait timeout
    await driver.manage().setTimeouts({ implicit: 10000 });

    return driver;
  }

  static async quitDriver(driver) {
    if (driver) {
      await driver.quit();
    }
  }

  static getBaseUrl() {
    return process.env.BASE_URL || 'http://localhost:5173';
  }

  static getApiUrl() {
    return process.env.API_URL || 'http://localhost:5000';
  }
}

module.exports = SeleniumConfig;
