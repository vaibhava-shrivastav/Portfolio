/**
 * ==========================================================================
 * ContactSection — Netflix-Inspired Cinematic Contact Terminal & Dossier
 * ==========================================================================
 * Features:
 * - Two-column desktop grid (form left, channels dossier right), stacked on mobile
 * - Name, Email, and Message inputs with live 2000-char counter
 * - Strict inline accessibility: label ties, aria-describedby, aria-invalid, aria-live
 * - Visually hidden honeypot field ("website") preventing spam bot abuse
 * - Robust state handling: idle, sending, success, unconfigured fallback, error
 * - Real success awards +20 XP (contact_form_sent) and unlocks "Reached Out" badge
 * - Link cards: Email, LinkedIn, GitHub, Resume (/resume.pdf) with +15 XP click awards
 * - Interactive terminal tip: "Tip: type 'contact' in the terminal"
 * - Reusable level-5-glow on Send button when visitor reaches Level 5 (Hired!)
 * - Zero phone numbers anywhere
 * ==========================================================================
 */
import { useState, useEffect, useRef } from 'react';
import { profile } from '../data/profile';
import { useGame } from '../context/GameContext';
import { submitContact, validateContactForm } from '../utils/submitContact';

export function ContactSection() {
  const { state, actions } = useGame();
  const currentLevel = state.level || 1;
  const isLevel5 = currentLevel >= 5;

  const sectionRef = useRef(null);
  const statusRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // honeypot
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'unconfigured' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // 1. "contact viewed" +20 XP once on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let awarded = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !awarded) {
            awarded = true;
            if (actions.awardAction) {
              actions.awardAction('contact_view', 20, 'Contact Terminal Reached');
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [actions]);

  // Handle Field Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (submitStatus === 'error' || submitStatus === 'unconfigured') {
      setSubmitStatus('idle');
      setStatusMessage('');
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pure validation check
    const validation = validateContactForm(formData);
    if (!validation.isValid && !formData.website) {
      setFieldErrors(validation.errors);
      setSubmitStatus('error');
      setStatusMessage('Please fix the highlighted errors above.');
      return;
    }

    setFieldErrors({});
    setSubmitStatus('sending');
    setStatusMessage('Transmitting message over secure channel...');

    try {
      const result = await submitContact(formData);

      if (result.status === 'success') {
        setSubmitStatus('success');
        setStatusMessage(result.message || "Message sent. I'll reply to your email.");

        // Real human submission awards +20 XP and badge (honeypot ignored)
        if (!result.honeypot) {
          if (actions.awardAction) {
            actions.awardAction('contact_form_sent', 20, 'Contact Form Sent');
          }
          if (actions.addToast) {
            actions.addToast({
              type: 'achievement',
              title: 'Transmission Sent!',
              message: '📬 Reached Out badge unlocked (+20 XP)',
              icon: '📬'
            });
          }
        }

        // Clear form inputs on success
        setFormData({
          name: '',
          email: '',
          message: '',
          website: ''
        });
      } else if (result.status === 'unconfigured') {
        setSubmitStatus('unconfigured');
        setStatusMessage(
          'Contact API endpoint is not yet configured for direct dispatch. Your message was NOT sent automatically. Please email me directly using the prefilled mailto link below.'
        );
        // Note: typed text preserved
      } else {
        setSubmitStatus('error');
        setStatusMessage(
          result.message || `Delivery failed. Please email me directly at ${profile.email}`
        );
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        // Note: typed text preserved
      }
    } catch (err) {
      setSubmitStatus('error');
      setStatusMessage(`Delivery failed. Please email me directly at ${profile.email}`);
    }
  };

  // Helper for Link Card XP Awards
  const handleLinkClick = (actionId) => {
    if (actions.awardAction && actionId) {
      actions.awardAction(actionId, 15);
    }
  };

  // Prefilled mailto link for unconfigured/error fallbacks
  const prefilledMailto = `mailto:${profile.email}?subject=${encodeURIComponent(
    `Portfolio Inquiry from ${formData.name || 'Visitor'}`
  )}&body=${encodeURIComponent(formData.message || '')}`;

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section contact-section"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        {/* Section Header Framing */}
        <header className="contact-section__header">
          <div className="contact-section__eyebrow font-mono">
            <span className="contact-section__pulse-dot" aria-hidden="true" />
            <span>INCOMING TRANSMISSION // CONTACT</span>
          </div>
          <h2 id="contact-heading" className="contact-section__title">
            Ready for the next episode?
          </h2>
          <p className="contact-section__subtitle">
            Let's build something together. Whether you have an open role, an ambitious project, or an engineering challenge to discuss.
          </p>
        </header>

        {/* 2-Column Responsive Grid */}
        <div className="contact-section__grid">
          {/* Left Column: Interactive Message Form Card */}
          <div className="contact-card contact-card--form">
            <div className="contact-card__header">
              <h3 className="contact-card__title font-mono">SEND A MESSAGE</h3>
              <span className="contact-card__badge font-mono">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                ENCRYPTED
              </span>
            </div>

            <form onSubmit={handleSubmit} noValidate className="contact-form">
              {/* Visually Hidden Honeypot Field */}
              <div className="contact-form__honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field blank</label>
                <input
                  type="text"
                  id="contact-website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              {/* Field 1: Name */}
              <div className="contact-form__group">
                <label htmlFor="contact-name" className="contact-form__label font-mono">
                  Your Name / Organization <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="e.g. Sarah Connor / Cyberdyne Labs"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                  className={`contact-form__input ${fieldErrors.name ? 'contact-form__input--invalid' : ''}`}
                />
                {fieldErrors.name && (
                  <p id="contact-name-error" className="contact-form__error font-mono" role="alert">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div className="contact-form__group">
                <label htmlFor="contact-email" className="contact-form__label font-mono">
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="e.g. sarah@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                  className={`contact-form__input ${fieldErrors.email ? 'contact-form__input--invalid' : ''}`}
                />
                {fieldErrors.email && (
                  <p id="contact-email-error" className="contact-form__error font-mono" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Message with Live Character Counter */}
              <div className="contact-form__group">
                <div className="contact-form__label-row">
                  <label htmlFor="contact-message" className="contact-form__label font-mono">
                    Message / Mission Brief <span className="text-primary">*</span>
                  </label>
                  <span
                    className={`contact-form__counter font-mono ${
                      formData.message.length > 2000 ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {formData.message.length} / 2000
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell me about the tech stack, problem space, or role..."
                  value={formData.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                  className={`contact-form__textarea ${
                    fieldErrors.message ? 'contact-form__textarea--invalid' : ''
                  }`}
                />
                {fieldErrors.message && (
                  <p id="contact-message-error" className="contact-form__error font-mono" role="alert">
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Status Banner (aria-live="polite") */}
              <div
                ref={statusRef}
                aria-live="polite"
                aria-atomic="true"
                className="contact-form__status-region"
              >
                {submitStatus === 'success' && (
                  <div className="contact-form__alert contact-form__alert--success">
                    <span className="contact-form__alert-icon" aria-hidden="true">✔</span>
                    <div>
                      <p className="contact-form__alert-text font-semibold">{statusMessage}</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'unconfigured' && (
                  <div className="contact-form__alert contact-form__alert--warning">
                    <span className="contact-form__alert-icon" aria-hidden="true">⚠️</span>
                    <div>
                      <p className="contact-form__alert-text font-semibold">{statusMessage}</p>
                      <a
                        href={prefilledMailto}
                        className="contact-form__fallback-btn font-mono"
                      >
                        📧 Open In Default Email Client ↗
                      </a>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="contact-form__alert contact-form__alert--error">
                    <span className="contact-form__alert-icon" aria-hidden="true">✖</span>
                    <div>
                      <p className="contact-form__alert-text font-semibold">{statusMessage}</p>
                      <a
                        href={`mailto:${profile.email}`}
                        className="contact-form__fallback-btn font-mono"
                      >
                        Email directly: {profile.email} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className={`btn btn--primary btn--full contact-form__submit-btn ${
                  isLevel5 ? 'level-5-glow' : ''
                }`}
              >
                {submitStatus === 'sending' ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Direct Channels & Dossier */}
          <div className="contact-card contact-card--dossier">
            <div className="contact-card__header">
              <h3 className="contact-card__title font-mono">DIRECT CHANNELS &amp; DOSSIER</h3>
              <span className="contact-card__status font-mono">
                <span className="contact-card__pulse-dot" aria-hidden="true" />
                SYS: ONLINE
              </span>
            </div>

            <div className="contact-dossier">
              {/* Card 1: Direct Inquiries (Email) */}
              <a
                href={`mailto:${profile.email}`}
                className="contact-dossier-card"
                aria-label={`Send direct email to ${profile.email}`}
              >
                <div className="contact-dossier-card__left">
                  <div className="contact-dossier-card__icon contact-dossier-card__icon--mail" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="contact-dossier-card__label font-mono">Direct Inquiries</span>
                    <span className="contact-dossier-card__value">{profile.email}</span>
                  </div>
                </div>
                <span className="contact-dossier-card__arrow" aria-hidden="true">↗</span>
              </a>

              {/* Card 2: Professional Network (LinkedIn) */}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick('link_click:linkedin')}
                className="contact-dossier-card"
                aria-label="Visit LinkedIn profile (opens in new tab)"
              >
                <div className="contact-dossier-card__left">
                  <div className="contact-dossier-card__icon contact-dossier-card__icon--linkedin" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                  <div>
                    <span className="contact-dossier-card__label font-mono">Professional Network</span>
                    <span className="contact-dossier-card__value">linkedin.com/in/vaibhavakumarshrivastav</span>
                  </div>
                </div>
                <span className="contact-dossier-card__arrow" aria-hidden="true">↗</span>
              </a>

              {/* Card 3: Code Repositories (GitHub) */}
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick('link_click:github')}
                className="contact-dossier-card"
                aria-label="Visit GitHub repositories (opens in new tab)"
              >
                <div className="contact-dossier-card__left">
                  <div className="contact-dossier-card__icon contact-dossier-card__icon--github" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <span className="contact-dossier-card__label font-mono">Code Repositories</span>
                    <span className="contact-dossier-card__value">github.com/vaibhava-shrivastav</span>
                  </div>
                </div>
                <span className="contact-dossier-card__arrow" aria-hidden="true">↗</span>
              </a>

              {/* Card 4: Official Resume Download */}
              <a
                href={profile.resumeUrl || '/resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick('link_click:resume')}
                className="contact-dossier-card contact-dossier-card--resume"
                aria-label="Download resume PDF (opens in new tab)"
              >
                <div className="contact-dossier-card__left">
                  <div className="contact-dossier-card__icon contact-dossier-card__icon--resume" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="contact-dossier-card__value text-white font-semibold">Download Resume</span>
                      <span className="contact-dossier-card__pdf-badge font-mono">PDF</span>
                    </div>
                    <span className="contact-dossier-card__meta font-mono">
                      Curriculum Vitae · Official Document
                    </span>
                  </div>
                </div>
                <span className="contact-dossier-card__arrow" aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Interactive CLI Tip Bar */}
        <div className="contact-section__tip-bar font-mono">
          <span className="contact-section__tip-dot" aria-hidden="true" />
          <span className="contact-section__tip-tag text-terminal">&gt;_ Tip:</span>
          <span className="contact-section__tip-text">
            type <code className="contact-section__tip-code">contact</code> in the terminal to jump here anytime
            <span className="contact-section__tip-sub"> (press ` or click floating button)</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
