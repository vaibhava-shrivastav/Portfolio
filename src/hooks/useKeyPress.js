/**
 * ==========================================================================
 * useKeyPress Hook — Keyboard event handling
 * ==========================================================================
 */
import { useEffect, useCallback, useRef } from 'react';

export function useKeyPress(targetKey, handler, options = {}) {
  const {
    eventType = 'keydown',
    preventDefault = false,
    stopPropagation = false,
    enabled = true
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const { key, code, ctrlKey, shiftKey, altKey, metaKey, repeat } = event;

      // Match by key or code
      const isMatch = key === targetKey || code === targetKey;

      if (isMatch) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        if (!repeat || targetKey.length > 1) { // Allow repeat for single chars
          handlerRef.current(event);
        }
      }
    };

    window.addEventListener(eventType, handleKeyDown);
    return () => window.removeEventListener(eventType, handleKeyDown);
  }, [targetKey, eventType, preventDefault, stopPropagation, enabled]);
}