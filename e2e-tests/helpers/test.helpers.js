// helpers/test.helpers.js
const { By, until } = require('selenium-webdriver');

class TestHelpers {
  constructor(driver) {
    this.driver = driver;
  }

  // Wait for element to be visible
  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(
      until.elementLocated(locator),
      timeout,
      `Element ${locator} not found within ${timeout}ms`
    );
  }

  // Wait for element to be visible and clickable
  async waitAndClick(locator, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    await element.click();
  }

  // Type text into input field
  async typeText(locator, text, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    await element.clear();
    await element.sendKeys(text);
  }

  // Get text from element
  async getText(locator, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    return await element.getText();
  }

  // Check if element exists
  async elementExists(locator) {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Wait for URL to contain specific string
  async waitForUrl(urlPart, timeout = 10000) {
    await this.driver.wait(
      until.urlContains(urlPart),
      timeout,
      `URL does not contain "${urlPart}" within ${timeout}ms`
    );
  }

  // Wait for alert and accept it
  async acceptAlert(timeout = 5000) {
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    await alert.accept();
  }

  // Take screenshot
  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot();
    const fs = require('fs');
    const path = require('path');

    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const filepath = path.join(screenshotDir, `${filename}.png`);
    fs.writeFileSync(filepath, screenshot, 'base64');
    return filepath;
  }

  // Login helper
  async login(username, password) {
    await this.typeText(By.name('username'), username);
    await this.typeText(By.name('password'), password);
    await this.waitAndClick(By.css('button[type="submit"]'));
  }

  // Wait for page load
  async waitForPageLoad(timeout = 10000) {
    await this.driver.wait(
      async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      },
      timeout,
      'Page did not load within timeout'
    );
  }

  // Scroll to element
  async scrollToElement(locator) {
    const element = await this.waitForElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
  }

  // Select dropdown by visible text
  async selectDropdownByText(locator, text) {
    const element = await this.waitForElement(locator);
    const options = await element.findElements(By.tagName('option'));

    for (let option of options) {
      const optionText = await option.getText();
      if (optionText === text) {
        await option.click();
        return;
      }
    }
    throw new Error(`Option with text "${text}" not found`);
  }

  // Get current URL
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  // Navigate to URL
  async navigateTo(url) {
    await this.driver.get(url);
    await this.waitForPageLoad();
  }
}

module.exports = TestHelpers;
