/**
 * ==========================================================================
 * Toast — Single-Item Queued Notification System
 * ==========================================================================
 * Features:
 * - Single visible toast at a time from GameContext queue
 * - Auto-dismiss after 5 seconds with pause on hover/focus
 * - Manual dismiss button (aria-label="Dismiss notification")
 * - role="status" and aria-live="polite" for screen readers
 * - Slide-in from right (instant with prefers-reduced-motion)
 * - Variants: Achievement (red left border & tint), Level Up, and XP (+X XP)
 * - Never obscures navbar XP bar or terminal button
 * ==========================================================================
 */
import { useEffect, useRef, useState } from 'react';
import { useUI, useGameActions } from '../context/GameContext';
import { Icon } from './Icon';

export function ToastContainer() {
  const { toasts, reducedMotion } = useUI();
  const { removeToast } = useGameActions();

  // Single active toast from front of queue
  const activeToast = (toasts && toasts.length > 0) ? toasts[0] : null;

  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!activeToast) return;

    if (!isPaused) {
      timerRef.current = setTimeout(() => {
        removeToast(activeToast.id);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeToast, isPaused, removeToast]);

  if (!activeToast) return null;

  const isAchievement = activeToast.type === 'achievement';
  const isLevelUp = activeToast.type === 'levelup';
  const isXp = activeToast.type === 'xp';

  return (
    <aside
      className="toast-container"
      aria-label="System notifications"
    >
      <div
        role="status"
        aria-live="polite"
        className={`toast-card toast-card--${activeToast.type || 'info'} ${
          reducedMotion ? 'toast-card--reduced-motion' : ''
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Glowing Badge / Icon Ring */}
        <div className="toast-card__icon-wrapper" aria-hidden="true">
          {isAchievement && (
            <div className="toast-card__icon-pulse" />
          )}
          <span className="toast-card__icon font-mono">
            <Icon
              name={activeToast.icon || (isAchievement ? 'trophy' : isLevelUp ? 'bolt' : 'sparkles')}
              size={20}
            />
          </span>
        </div>

        {/* Text Content */}
        <div className="toast-card__content">
          <div className="toast-card__header">
            <span className="toast-card__indicator" />
            <span className="toast-card__category font-mono">
              {isAchievement
                ? 'ACHIEVEMENT UNLOCKED'
                : isLevelUp
                ? 'SYSTEM PROMOTION'
                : 'EXPERIENCE GAINED'}
            </span>
          </div>

          <h4 className="toast-card__title">
            {activeToast.title}
          </h4>

          {activeToast.message && (
            <p className="toast-card__message">
              {activeToast.message}
            </p>
          )}

          {isXp && activeToast.amount && (
            <div className="toast-card__xp-pill font-mono">
              +{activeToast.amount} XP RECORDED
            </div>
          )}
        </div>

        {/* Manual Dismiss Button */}
        <button
          type="button"
          onClick={() => removeToast(activeToast.id)}
          className="toast-card__dismiss-btn"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </aside>
  );
}

export function useToast() {
  const { addToast } = useGameActions();
  return {
    success: (title, message) => addToast({ type: 'info', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    achievement: (title, message) => addToast({ type: 'achievement', title, message }),
    xp: (amount, label) => addToast({ type: 'xp', amount, title: `+${amount} XP`, message: label })
  };
}
