/**
 * ==========================================================================
 * ErrorBoundary — Friendly Application Fallback
 * ==========================================================================
 * Plain React class component (zero dependencies) catching uncaught render errors.
 * Provides a recovery button and direct email link to the developer.
 */
import React from 'react';
import { profile } from '../data/profile';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const email = profile?.email || 'vaibhavakumarshrivastav@gmail.com';
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0c',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#141419',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(229, 9, 20, 0.15)',
                color: '#e50914',
                fontSize: '24px',
                marginBottom: '16px'
              }}
            >
              ⚠
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em'
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#a1a1aa',
                lineHeight: 1.6,
                margin: '0 0 24px 0'
              }}
            >
              An unexpected interface error occurred. Please reload to restore your session, or reach out directly.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#e50914',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload
              </button>
              <a
                href={`mailto:${email}?subject=Portfolio%20Issue%20Report`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#e4e4e7',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Contact ({email})
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
