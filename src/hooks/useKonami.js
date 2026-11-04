/**
 * ==========================================================================
 * useKonami — Global Konami Code Sequence Listener
 * ==========================================================================
 * Sequence: ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight,
 *           ArrowLeft, ArrowRight, b, a
 *
 * Rules:
 * - Ignored when an input, textarea, select, or contenteditable element is focused
 * - Invokes callback on successful entry and resets sequence
 * ==========================================================================
 */
import { useEffect, useRef } from 'react';

export const KONAMI_CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a'
];

/**
 * Pure helper to verify if an array of key strings matches the Konami sequence.
 */
export function isKonamiSequence(keys = []) {
  if (!Array.isArray(keys) || keys.length !== KONAMI_CODE.length) return false;
  return keys.every((k, idx) => String(k).toLowerCase() === KONAMI_CODE[idx]);
}

function isEditableElement(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

export function useKonami(onSuccess) {
  const sequenceRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof onSuccess !== 'function') return;

    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input/textarea
      if (isEditableElement(e.target)) {
        sequenceRef.current = [];
        return;
      }

      const key = e.key.toLowerCase();
      sequenceRef.current.push(key);

      // Keep only up to code length
      if (sequenceRef.current.length > KONAMI_CODE.length) {
        sequenceRef.current.shift();
      }

      // Check match
      if (isKonamiSequence(sequenceRef.current)) {
        sequenceRef.current = [];
        onSuccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSuccess]);
}

export default useKonami;
