import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePayload,
  sanitizeHeader,
  escapeHtml,
  sanitizeText,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH
} from '../src/validate.mjs';

test('validatePayload: accepts valid submission payload', () => {
  const input = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I loved your portfolio project! Let us connect.'
  };

  const result = validatePayload(input);
  assert.equal(result.isValid, true);
  assert.equal(result.isHoneypot, false);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.name, 'Jane Doe');
  assert.equal(result.sanitized.email, 'jane@example.com');
  assert.equal(result.sanitized.message, 'Hello, I loved your portfolio project! Let us connect.');
});

test('validatePayload: detects honeypot field and returns early without errors', () => {
  const input = {
    name: 'Spam Bot',
    email: 'spam@bot.net',
    message: 'Buy our product now!',
    website: 'https://spamsite.xyz'
  };

  const result = validatePayload(input);
  assert.equal(result.isValid, true);
  assert.equal(result.isHoneypot, true);
  assert.deepEqual(result.errors, {});
});

test('validatePayload: rejects CRLF injection in name and email', () => {
  const result1 = validatePayload({
    name: 'Jane\r\nBcc: victim@example.com',
    email: 'valid@example.com',
    message: 'This message has valid length.'
  });
  assert.equal(result1.isValid, false);
  assert.match(result1.errors.name, /newline/i);

  const result2 = validatePayload({
    name: 'Jane Doe',
    email: 'jane@example.com\nBcc: evil@example.com',
    message: 'This message has valid length.'
  });
  assert.equal(result2.isValid, false);
  assert.match(result2.errors.email, /newline/i);
});

test('validatePayload: validates name bounds and presence', () => {
  // Empty or missing
  assert.equal(validatePayload({ name: '', email: 'a@b.co', message: 'Valid message 123' }).isValid, false);
  assert.equal(validatePayload({ name: '   ', email: 'a@b.co', message: 'Valid message 123' }).isValid, false);
  assert.equal(validatePayload({ email: 'a@b.co', message: 'Valid message 123' }).isValid, false);

  // Maximum length (80)
  const exactMax = 'A'.repeat(MAX_NAME_LENGTH);
  const resultMax = validatePayload({ name: exactMax, email: 'a@b.co', message: 'Valid message 123' });
  assert.equal(resultMax.isValid, true);

  const overMax = 'A'.repeat(MAX_NAME_LENGTH + 1);
  const resultOver = validatePayload({ name: overMax, email: 'a@b.co', message: 'Valid message 123' });
  assert.equal(resultOver.isValid, false);
  assert.match(resultOver.errors.name, /characters or fewer/i);
});

test('validatePayload: validates email format and length', () => {
  // Invalid formats
  const invalidEmails = ['plainaddress', '@missingusername.com', 'username@.com', 'user@domain', 'user@domain..com'];
  for (const email of invalidEmails) {
    const res = validatePayload({ name: 'Valid Name', email, message: 'Valid message 123' });
    assert.equal(res.isValid, false, `Expected ${email} to be invalid`);
    assert.match(res.errors.email, /valid email address/i);
  }

  // Valid formats
  const validEmails = ['user@domain.com', 'first.last+tag@sub.domain.org', 'dev_123@aws.co.uk'];
  for (const email of validEmails) {
    const res = validatePayload({ name: 'Valid Name', email, message: 'Valid message 123' });
    assert.equal(res.isValid, true, `Expected ${email} to be valid`);
  }

  // Maximum email length (254)
  const longEmail = 'a'.repeat(240) + '@example.com'; // 252 chars -> valid
  assert.equal(validatePayload({ name: 'Valid Name', email: longEmail, message: 'Valid message 123' }).isValid, true);

  const tooLongEmail = 'a'.repeat(250) + '@example.com'; // 262 chars -> invalid
  const resTooLong = validatePayload({ name: 'Valid Name', email: tooLongEmail, message: 'Valid message 123' });
  assert.equal(resTooLong.isValid, false);
  assert.match(resTooLong.errors.email, /too long/i);
});

test('validatePayload: validates message bounds (10 to 2000 chars)', () => {
  // Too short (< 10)
  const shortMsg = 'Hi there!'; // 9 chars
  const resShort = validatePayload({ name: 'Valid Name', email: 'a@b.co', message: shortMsg });
  assert.equal(resShort.isValid, false);
  assert.match(resShort.errors.message, /at least 10 characters/i);

  // Exact minimum (10)
  const minMsg = '1234567890'; // 10 chars
  const resMin = validatePayload({ name: 'Valid Name', email: 'a@b.co', message: minMsg });
  assert.equal(resMin.isValid, true);

  // Exact maximum (2000)
  const maxMsg = 'M'.repeat(MAX_MESSAGE_LENGTH);
  const resMax = validatePayload({ name: 'Valid Name', email: 'a@b.co', message: maxMsg });
  assert.equal(resMax.isValid, true);

  // Too long (> 2000)
  const overMsg = 'M'.repeat(MAX_MESSAGE_LENGTH + 1);
  const resOver = validatePayload({ name: 'Valid Name', email: 'a@b.co', message: overMsg });
  assert.equal(resOver.isValid, false);
  assert.match(resOver.errors.message, /2000 characters or fewer/i);
});

test('sanitizeHeader: strips newlines, control characters and enforces length', () => {
  const dirty = 'Portfolio contact:\r\nNew Header: value\t  Another line   ';
  const clean = sanitizeHeader(dirty, 100);
  assert.equal(clean, 'Portfolio contact: New Header: value Another line');

  // Test truncation
  const longHeader = 'A'.repeat(150);
  assert.equal(sanitizeHeader(longHeader, 50).length, 50);
});

test('escapeHtml: escapes HTML characters properly', () => {
  const raw = '<script>alert("XSS & \'hack\'");</script>';
  const escaped = escapeHtml(raw);
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;XSS &amp; &#39;hack&#39;&quot;);&lt;/script&gt;'
  );
  assert.equal(escapeHtml('Clean text'), 'Clean text');
  assert.equal(escapeHtml(null), '');
});

test('sanitizeText: strips ASCII control chars while preserving newlines and tabs', () => {
  const dirty = 'Line 1\x00\x07\x1B\nLine 2\tEnd';
  const cleaned = sanitizeText(dirty);
  assert.equal(cleaned, 'Line 1\nLine 2\tEnd');
});
