/**
 * ==========================================================================
 * Row — Reusable Netflix-Style Horizontal Shelf Component
 * ==========================================================================
 * Features:
 * - Finite horizontal scroll-snap track with smooth touch-swipe
 * - Desktop arrow buttons with edge disable states (isAtStart / isAtEnd)
 * - Keyboard navigation (ArrowLeft / ArrowRight / Home / End) across cards
 * - Respects prefers-reduced-motion for instant jumps
 * - Accessible ARIA labels and roles
 * - Exports base Card / Badge helpers for backwards-compatible placeholders
 * ==========================================================================
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useUI } from '../context/GameContext';

export function Row({
  id,
  title,
  subtitle,
  badgeText,
  items = [],
  renderItem,
  action,
  className = '',
  ariaLabel
}) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { reducedMotion } = useUI();

  // Check scroll boundary status
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items, updateScrollState]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75 * direction;
    el.scrollBy({
      left: scrollAmount,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  };

  // Keyboard navigation within the track
  const handleKeyDown = (e) => {
    const el = trackRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll('[role="button"], a, [tabindex="0"]'));
    const currentIndex = cards.indexOf(document.activeElement);

    if (e.key === 'ArrowRight' && currentIndex !== -1 && currentIndex < cards.length - 1) {
      e.preventDefault();
      cards[currentIndex + 1].focus();
      cards[currentIndex + 1].scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      cards[currentIndex - 1].focus();
      cards[currentIndex - 1].scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    } else if (e.key === 'Home' && cards.length > 0) {
      e.preventDefault();
      cards[0].focus();
      cards[0].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    } else if (e.key === 'End' && cards.length > 0) {
      e.preventDefault();
      cards[cards.length - 1].focus();
      cards[cards.length - 1].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  };

  return (
    <section
      id={id}
      className={`row-shelf ${className}`}
      aria-label={ariaLabel || title}
    >
      <div className="container">
        {/* Row Header */}
        <div className="row-shelf__header">
          <div className="row-shelf__title-group">
            <div className="row-shelf__accent-bar" aria-hidden="true" />
            <h2 className="row-shelf__title">
              {title}
            </h2>
            {badgeText && (
              <span className="row-shelf__badge font-mono">
                {badgeText}
              </span>
            )}
            {subtitle && (
              <span className="row-shelf__subtitle font-mono">
                {subtitle}
              </span>
            )}
          </div>

          {/* Action Link (e.g. Explore All Repos) */}
          {action && (
            <div className="row-shelf__action">
              {action}
            </div>
          )}
        </div>

        {/* Shelf Wrapper with Desktop Arrow Controls */}
        <div className="row-shelf__wrapper">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            className={`row-shelf__arrow row-shelf__arrow--left ${
              !canScrollLeft ? 'row-shelf__arrow--disabled' : ''
            }`}
            aria-label={`Scroll ${title} left`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Scroll Track */}
          <div
            ref={trackRef}
            onKeyDown={handleKeyDown}
            className="row-shelf__track snap-x"
            tabIndex={0}
            role="region"
            aria-label={`${title} scroll area`}
          >
            {items.map((item, index) => (
              <div key={item.id || index} className="row-shelf__item snap-start">
                {renderItem(item, index)}
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            className={`row-shelf__arrow row-shelf__arrow--right ${
              !canScrollRight ? 'row-shelf__arrow--disabled' : ''
            }`}
            aria-label={`Scroll ${title} right`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * ==========================================================================
 * Card & Badge Helpers (preserves placeholder compatibility)
 * ==========================================================================
 */
export function Card({ children, className = '', variant = 'default', hover = true, ...props }) {
  const variants = {
    default: 'card',
    glass: 'card card--glass',
    terminal: 'card card--terminal'
  };
  return (
    <article className={`${variants[variant] || 'card'} ${hover ? '' : 'card--no-hover'} ${className}`} {...props}>
      {children}
    </article>
  );
}

export function CardMedia({ children, ...props }) {
  return <div className="card__media" {...props}>{children}</div>;
}

export function CardBody({ children, ...props }) {
  return <div className="card__body" {...props}>{children}</div>;
}

export function CardFooter({ children, ...props }) {
  return <div className="card__footer" {...props}>{children}</div>;
}

export function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variants = {
    primary: 'badge badge--primary',
    terminal: 'badge badge--terminal',
    cyan: 'badge badge--cyan',
    neutral: 'badge badge--neutral',
    success: 'badge badge--success',
    warning: 'badge badge--warning'
  };
  return (
    <span className={`${variants[variant] || 'badge'} ${className}`} {...props}>
      {children}
    </span>
  );
}
