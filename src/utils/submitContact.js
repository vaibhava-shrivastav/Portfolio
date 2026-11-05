/**
 * ==========================================================================
 * submitContact — Pure Form Validation, Rate Limiting & API Submission
 * ==========================================================================
 * Security & Reliability Rules:
 * - Trims inputs and strips non-printable control characters
 * - Name: 1 to 80 chars
 * - Email: standard email format validation, max 254 chars
 * - Message: 10 to 2000 chars
 * - Honeypot "website": if filled, silently pretends success without sending
 * - 30-second repeat send cooldown via sessionStorage
 * - If VITE_CONTACT_API_URL is unset/empty, returns status: "unconfigured"
 * - Network call has 10-second AbortController timeout
 * - Never logs message contents or sensitive user data
 * - Zero hardcoded AWS secrets
 * ==========================================================================
 */

export const LAST_SEND_STORAGE_KEY = 'portfolio-contact-last-send';
export const COOLDOWN_MS = 30000;
export const REQUEST_TIMEOUT_MS = 10000;

/**
 * Strips non-printable ASCII control characters (keeps newlines, tabs, and carriage returns)
 */
export function sanitizeText(val = '') {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Pure validator function for contact form inputs.
 * Returns { isValid: boolean, errors: { name?: string, email?: string, message?: string } }
 */
export function validateContactForm({ name = '', email = '', message = '' } = {}) {
  const cleanName = sanitizeText(name);
  const cleanEmail = sanitizeText(email);
  const cleanMessage = sanitizeText(message);

  const errors = {};

  // Name validation: 1 to 80 chars
  if (!cleanName) {
    errors.name = 'Please enter your name or organization (1 to 80 characters).';
  } else if (cleanName.length > 80) {
    errors.name = `Name must be 80 characters or fewer (currently ${cleanName.length}).`;
  }

  // Email validation: RFC-standard format, max 254 chars
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail) {
    errors.email = 'Please enter your email address.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
  } else if (cleanEmail.length > 254) {
    errors.email = 'Email address is too long (maximum 254 characters).';
  }

  // Message validation: 10 to 2000 chars
  if (!cleanMessage) {
    errors.message = 'Please enter a message (10 to 2000 characters).';
  } else if (cleanMessage.length < 10) {
    errors.message = `Message must be at least 10 characters (currently ${cleanMessage.length}).`;
  } else if (cleanMessage.length > 2000) {
    errors.message = `Message must be 2000 characters or fewer (currently ${cleanMessage.length}).`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage
    }
  };
}

/**
 * Resolves current configured API endpoint from Vite env or process.env
 */
function getApiUrl(customUrl) {
  if (typeof customUrl === 'string') return customUrl.trim();
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_API_URL) {
      return import.meta.env.VITE_CONTACT_API_URL.trim();
    }
  } catch (e) {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env?.VITE_CONTACT_API_URL) {
      return process.env.VITE_CONTACT_API_URL.trim();
    }
  } catch (e) {
    // ignore
  }
  return '';
}

/**
 * Main submission function.
 * @param {Object} formData { name, email, message, website }
 * @param {Object} [options] Optional overrides for unit testing { apiUrl, fetchImpl, now, storage }
 * @returns {Promise<{ status: "success"|"unconfigured"|"error", message?: string, errors?: Object, honeypot?: boolean }>}
 */
export async function submitContact(
  { name = '', email = '', message = '', website = '' } = {},
  options = {}
) {
  const now = typeof options.now === 'function' ? options.now() : Date.now();
  const storage = options.storage || (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
  const fetchFn = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);

  // 1. Honeypot check: If the hidden "website" field is populated, silently pretend success
  const cleanWebsite = sanitizeText(website);
  if (cleanWebsite) {
    return {
      status: 'success',
      honeypot: true,
      message: "Message sent. I'll reply to your email."
    };
  }

  // 2. Pure input validation
  const validation = validateContactForm({ name, email, message });
  if (!validation.isValid) {
    return {
      status: 'error',
      errors: validation.errors,
      message: 'Please resolve the highlighted field errors.'
    };
  }

  const { name: cleanName, email: cleanEmail, message: cleanMessage } = validation.sanitized;

  // 3. 30-Second Rate Limit Check
  if (storage) {
    try {
      const lastSend = storage.getItem(LAST_SEND_STORAGE_KEY);
      if (lastSend) {
        const elapsed = now - Number(lastSend);
        if (elapsed < COOLDOWN_MS) {
          const remainingSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          return {
            status: 'error',
            message: `Please wait ${remainingSec}s before sending another message.`
          };
        }
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  // 4. API URL Check
  const apiUrl = getApiUrl(options.apiUrl);
  if (!apiUrl) {
    return {
      status: 'unconfigured',
      message: 'Contact API is unconfigured in this environment. Please email directly.'
    };
  }

  // 5. Network POST with AbortController 10s timeout
  if (!fetchFn) {
    return {
      status: 'error',
      message: 'Network client unavailable in this environment.'
    };
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || REQUEST_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      // Record last send timestamp on real success
      if (storage) {
        try {
          storage.setItem(LAST_SEND_STORAGE_KEY, String(now));
        } catch (e) {
          // ignore
        }
      }

      return {
        status: 'success',
        honeypot: false,
        message: "Message sent. I'll reply to your email."
      };
    }

    let errorDetail = '';
    try {
      const json = await response.json();
      errorDetail = json?.message || json?.error || '';
    } catch (e) {
      // non-JSON response
    }

    return {
      status: 'error',
      message: errorDetail || `Delivery failed (HTTP ${response.status}). Please try again or email directly.`
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        status: 'error',
        message: 'Request timed out after 10 seconds. Please check your connection or email directly.'
      };
    }

    return {
      status: 'error',
      message: 'Network error preventing message delivery. Please email directly.'
    };
  }
}
