/**
 * ==========================================================================
 * Contact Form Submission & Validation Unit Tests
 * ==========================================================================
 * Tested via node:test (zero external test dependencies)
 * ==========================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateContactForm,
  sanitizeText,
  submitContact,
  LAST_SEND_STORAGE_KEY,
  COOLDOWN_MS
} from '../src/utils/submitContact.js';

test('1. sanitizeText strips non-printable ASCII control characters but preserves newlines', () => {
  const dirty = 'Hello\x00\x07 World\x1F!\nLine 2\tTabbed\r';
  const clean = sanitizeText(dirty);
  assert.equal(clean, 'Hello World!\nLine 2\tTabbed');
});

test('2. validateContactForm validates name length (1 to 80 chars)', () => {
  // Empty name
  const emptyRes = validateContactForm({ name: '', email: 'test@example.com', message: 'Valid message content' });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.name);

  // Whitespace only
  const wsRes = validateContactForm({ name: '   ', email: 'test@example.com', message: 'Valid message content' });
  assert.equal(wsRes.isValid, false);
  assert.ok(wsRes.errors.name);

  // Valid name
  const validRes = validateContactForm({ name: 'Alice Walker', email: 'test@example.com', message: 'Valid message content' });
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.errors.name, undefined);

  // Exceeds 80 chars
  const longName = 'A'.repeat(81);
  const longRes = validateContactForm({ name: longName, email: 'test@example.com', message: 'Valid message content' });
  assert.equal(longRes.isValid, false);
  assert.match(longRes.errors.name, /80 characters or fewer/i);
});

test('3. validateContactForm validates email format and length', () => {
  // Empty email
  const emptyRes = validateContactForm({ name: 'Valid Name', email: '', message: 'Valid message content' });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.email);

  // Invalid email formats
  const invalids = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain'];
  for (const inv of invalids) {
    const res = validateContactForm({ name: 'Valid Name', email: inv, message: 'Valid message content' });
    assert.equal(res.isValid, false, `Email "${inv}" should be marked invalid`);
    assert.ok(res.errors.email);
  }

  // Valid email
  const validRes = validateContactForm({ name: 'Valid Name', email: 'recruiter@tech.company.com', message: 'Valid message content' });
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.errors.email, undefined);
});

test('4. validateContactForm validates message length (10 to 2000 chars)', () => {
  // Too short (< 10 chars)
  const shortRes = validateContactForm({ name: 'Valid Name', email: 'test@example.com', message: 'Short' });
  assert.equal(shortRes.isValid, false);
  assert.match(shortRes.errors.message, /at least 10 characters/i);

  // Exactly 10 chars
  const tenChars = '1234567890';
  const minRes = validateContactForm({ name: 'Valid Name', email: 'test@example.com', message: tenChars });
  assert.equal(minRes.isValid, true);

  // Too long (> 2000 chars)
  const longMsg = 'X'.repeat(2001);
  const longRes = validateContactForm({ name: 'Valid Name', email: 'test@example.com', message: longMsg });
  assert.equal(longRes.isValid, false);
  assert.match(longRes.errors.message, /2000 characters or fewer/i);
});

test('5. Honeypot traps automated bots and silently pretends success', async () => {
  let fetchCalled = false;
  const mockFetch = async () => {
    fetchCalled = true;
    return { ok: true };
  };

  const res = await submitContact(
    {
      name: 'Spam Bot',
      email: 'spam@bot.net',
      message: 'Cheap sunglasses at URL',
      website: 'http://spam.example.com' // Honeypot filled!
    },
    {
      apiUrl: 'https://api.example.com/contact',
      fetchImpl: mockFetch
    }
  );

  assert.equal(res.status, 'success');
  assert.equal(res.honeypot, true);
  assert.equal(fetchCalled, false, 'Fetch must NOT be called when honeypot is tripped');
});

test('6. Returns status: "unconfigured" when VITE_CONTACT_API_URL is unset or empty', async () => {
  let fetchCalled = false;
  const mockFetch = async () => {
    fetchCalled = true;
    return { ok: true };
  };

  const res = await submitContact(
    {
      name: 'Recruiter User',
      email: 'recruiter@company.com',
      message: 'Hello Vaibhava, interested in discussing opportunities.'
    },
    {
      apiUrl: '', // empty / unset
      fetchImpl: mockFetch
    }
  );

  assert.equal(res.status, 'unconfigured');
  assert.equal(fetchCalled, false, 'Fetch must not be invoked when API URL is empty');
});

test('7. Enforces 30-second cooldown between consecutive submissions', async () => {
  const mockStorage = {
    store: {},
    getItem(key) {
      return this.store[key] || null;
    },
    setItem(key, val) {
      this.store[key] = String(val);
    }
  };

  const baseTime = 1000000;
  mockStorage.setItem(LAST_SEND_STORAGE_KEY, String(baseTime));

  const resBlocked = await submitContact(
    {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Second message right after first'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      storage: mockStorage,
      now: () => baseTime + 10000 // 10s elapsed (< 30s)
    }
  );

  assert.equal(resBlocked.status, 'error');
  assert.match(resBlocked.message, /wait \d+s/i);

  // After 31 seconds, allowed
  const resAllowed = await submitContact(
    {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Second message after cooldown period'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      storage: mockStorage,
      now: () => baseTime + 31000,
      fetchImpl: async () => ({ ok: true, json: async () => ({}) })
    }
  );

  assert.equal(resAllowed.status, 'success');
});

test('8. Network timeout handling (AbortController 10s timeout)', async () => {
  const abortFetch = async (url, { signal }) => {
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        const err = new Error('The user aborted a request.');
        err.name = 'AbortError';
        reject(err);
      });
    });
  };

  const res = await submitContact(
    {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Checking network timeout handling'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      fetchImpl: abortFetch,
      timeoutMs: 50 // fast timeout for test
    }
  );

  assert.equal(res.status, 'error');
  assert.match(res.message, /timed out/i);
});

test('9. Success path updates storage and returns success response', async () => {
  const mockStorage = {
    store: {},
    getItem(key) {
      return this.store[key] || null;
    },
    setItem(key, val) {
      this.store[key] = String(val);
    }
  };

  let capturedBody = null;
  const mockFetch = async (url, options) => {
    capturedBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ success: true }) };
  };

  const testTime = 5000000;
  const res = await submitContact(
    {
      name: 'Hiring Manager',
      email: 'hiring@startup.io',
      message: 'We loved your GLA Exchange project architecture!'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      fetchImpl: mockFetch,
      storage: mockStorage,
      now: () => testTime
    }
  );

  assert.equal(res.status, 'success');
  assert.equal(res.honeypot, false);
  assert.equal(mockStorage.getItem(LAST_SEND_STORAGE_KEY), String(testTime));
  assert.equal(capturedBody.name, 'Hiring Manager');
  assert.equal(capturedBody.email, 'hiring@startup.io');
});

test('10. Error path handles server error gracefully', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 502,
    json: async () => ({ message: 'Bad Gateway from lambda proxy' })
  });

  const res = await submitContact(
    {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Testing server failure response'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      fetchImpl: mockFetch
    }
  );

  assert.equal(res.status, 'error');
  assert.match(res.message, /Bad Gateway/i);
});

test('11. 400 validation error response extracts field-level errors', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({
      ok: false,
      error: 'Validation failed',
      errors: { name: 'Name contains invalid characters', email: 'Email domain invalid' }
    })
  });

  const res = await submitContact(
    {
      name: 'Bad Name',
      email: 'bad@email.com',
      message: 'Testing 400 response mapping'
    },
    {
      apiUrl: 'https://api.example.com/contact',
      fetchImpl: mockFetch
    }
  );

  assert.equal(res.status, 'error');
  assert.equal(res.errors.name, 'Name contains invalid characters');
  assert.equal(res.errors.email, 'Email domain invalid');
  assert.equal(res.message, 'Validation failed');
});
