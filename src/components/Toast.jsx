/**
 * ==========================================================================
 * Toast — Minimal placeholder (full implementation in later stage)
 * ==========================================================================
 */
export function ToastContainer() {
  // Full notification system will be implemented in a later stage
  return null;
}

export function useToast() {
  return {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    achievement: () => {}
  };
}