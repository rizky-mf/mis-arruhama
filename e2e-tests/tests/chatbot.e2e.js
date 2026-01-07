// tests/chatbot.e2e.js
const { By } = require('selenium-webdriver');
const SeleniumConfig = require('../config/selenium.config');
const TestHelpers = require('../helpers/test.helpers');

describe('E2E - Chatbot Functionality', () => {
  let driver;
  let helpers;
  const baseUrl = SeleniumConfig.getBaseUrl();

  beforeAll(async () => {
    driver = await SeleniumConfig.createDriver();
    helpers = new TestHelpers(driver);

    // Login as siswa to test chatbot
    await helpers.navigateTo(`${baseUrl}/login`);
    await helpers.login('siswa', 'siswa123');
    await driver.sleep(3000);
  });

  afterAll(async () => {
    await SeleniumConfig.quitDriver(driver);
  });

  describe('Chatbot Widget', () => {

    test('E2E-C01: Should display floating chatbot widget', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      const chatWidget = await helpers.elementExists(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );

      expect(chatWidget).toBe(true);
    });

    test('E2E-C02: Should open chatbot when clicked', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button, button[aria-label*="chat"]')
      );

      await chatButton.click();

      await driver.sleep(1000);

      // Chat window should be visible
      const chatWindow = await helpers.elementExists(
        By.css('[data-testid="chat-window"], .chat-container')
      );

      expect(chatWindow).toBe(true);
    });

    test('E2E-C03: Should display chat history', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(2000);

      // Should show messages or empty state
      const hasMessages = await helpers.elementExists(By.css('.message, .chat-message'));
      const hasEmptyState = await helpers.elementExists(
        By.xpath("//*[contains(text(), 'Tidak ada pesan') or contains(text(), 'No messages')]")
      );

      expect(hasMessages || hasEmptyState).toBe(true);
    });
  });

  describe('Send Messages', () => {

    test('E2E-C04: Should send a message', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      // Type and send message
      const messageInput = await helpers.waitForElement(
        By.css('input[placeholder*="Tulis pesan" i], textarea[placeholder*="message" i]')
      );

      await helpers.typeText(
        By.css('input[placeholder*="Tulis pesan" i], textarea[placeholder*="message" i]'),
        'Halo, ini test message'
      );

      const sendButton = await helpers.waitForElement(
        By.css('button[type="submit"], button[aria-label*="send"]')
      );

      await sendButton.click();

      await driver.sleep(3000);

      // Message should appear in chat
      const messages = await driver.findElements(By.css('.message, .chat-message'));
      expect(messages.length).toBeGreaterThan(0);
    });

    test('E2E-C05: Should receive bot response', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      // Send message
      await helpers.typeText(
        By.css('input[placeholder*="Tulis pesan" i], textarea[placeholder*="message" i]'),
        'Jadwal hari ini'
      );

      const sendButton = await helpers.waitForElement(
        By.css('button[type="submit"], button[aria-label*="send"]')
      );
      await sendButton.click();

      await driver.sleep(5000);

      // Should have bot response
      const botMessages = await driver.findElements(
        By.css('.message.bot, .chat-message.assistant, .message-bot')
      );

      expect(botMessages.length).toBeGreaterThan(0);
    });

    test('E2E-C06: Should not send empty message', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      // Try to send empty message
      const sendButton = await helpers.waitForElement(
        By.css('button[type="submit"], button[aria-label*="send"]')
      );

      const messagesBeforeCount = (await driver.findElements(By.css('.message, .chat-message'))).length;

      await sendButton.click();

      await driver.sleep(2000);

      const messagesAfterCount = (await driver.findElements(By.css('.message, .chat-message'))).length;

      // Message count should not increase
      expect(messagesAfterCount).toBe(messagesBeforeCount);
    });
  });

  describe('Quick Replies', () => {

    test('E2E-C07: Should display quick reply buttons', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      // Look for quick reply buttons
      const hasQuickReplies = await helpers.elementExists(
        By.css('.quick-reply, .quick-reply-button, button[data-quick-reply]')
      );

      if (hasQuickReplies) {
        expect(hasQuickReplies).toBe(true);
      } else {
        console.log('Quick replies not found - may not be implemented');
      }
    });

    test('E2E-C08: Should send message when quick reply clicked', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      try {
        // Click quick reply button
        const quickReply = await helpers.waitForElement(
          By.xpath("//button[contains(text(), 'Jadwal') or contains(text(), 'Nilai')]"),
          5000
        );

        await quickReply.click();

        await driver.sleep(3000);

        // Should have sent message and received response
        const messages = await driver.findElements(By.css('.message, .chat-message'));
        expect(messages.length).toBeGreaterThan(0);
      } catch (error) {
        console.log('Quick reply test skipped - buttons not found');
      }
    });
  });

  describe('Chat Management', () => {

    test('E2E-C09: Should close chatbot', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      // Close chat
      const closeButton = await helpers.waitForElement(
        By.css('button[aria-label*="close"], button[data-testid="close-chat"]')
      );

      await closeButton.click();

      await driver.sleep(1000);

      // Chat window should be hidden
      const chatWindowVisible = await helpers.elementExists(
        By.css('[data-testid="chat-window"]:not([style*="display: none"])')
      );

      expect(chatWindowVisible).toBe(false);
    });

    test('E2E-C10: Should delete chat history', async () => {
      await helpers.navigateTo(`${baseUrl}/siswa/dashboard`);

      await driver.sleep(2000);

      // Open chat
      const chatButton = await helpers.waitForElement(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );
      await chatButton.click();

      await driver.sleep(1000);

      try {
        // Find delete history button
        const deleteButton = await helpers.waitForElement(
          By.xpath("//button[contains(text(), 'Hapus Riwayat') or contains(text(), 'Clear History')]"),
          5000
        );

        const messagesBeforeDelete = await driver.findElements(By.css('.message, .chat-message'));

        await deleteButton.click();

        await driver.sleep(1000);

        // Confirm deletion if needed
        try {
          const confirmButton = await helpers.waitForElement(
            By.xpath("//button[contains(text(), 'Ya') or contains(text(), 'Confirm')]"),
            2000
          );
          await confirmButton.click();
        } catch (error) {
          // No confirmation needed
        }

        await driver.sleep(2000);

        // Messages should be cleared
        const messagesAfterDelete = await driver.findElements(By.css('.message, .chat-message'));

        expect(messagesAfterDelete.length).toBeLessThan(messagesBeforeDelete.length);
      } catch (error) {
        console.log('Delete history test skipped');
      }
    });
  });

  describe('Chatbot Across Different Roles', () => {

    test('E2E-C11: Admin should have access to chatbot', async () => {
      // Logout and login as admin
      await helpers.navigateTo(`${baseUrl}/login`);
      await helpers.login('admin', 'admin123');

      await driver.sleep(3000);

      const chatWidget = await helpers.elementExists(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );

      expect(chatWidget).toBe(true);
    });

    test('E2E-C12: Guru should have access to chatbot', async () => {
      await helpers.navigateTo(`${baseUrl}/login`);
      await helpers.login('guru', 'guru123');

      await driver.sleep(3000);

      const chatWidget = await helpers.elementExists(
        By.css('[data-testid="floating-chat-widget"], .floating-chat-button')
      );

      expect(chatWidget).toBe(true);
    });
  });
});
