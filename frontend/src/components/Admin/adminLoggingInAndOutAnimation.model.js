/**
 * adminLoggingInAndOutAnimation.model.js
 *
 * Static data and timing for the BACKLINE signing animation.
 * Kept separate because AdminDashboardHeader and AdminLoginPage also
 * import the hold duration and session key for navigation logic.
 *
 * If you change timing here, update the 1480ms CSS fallback in
 * admin.module.css (.adminThinkingBrandWrapActive .adminThinkingChar).
 */

/* -- Animation Timing -- */

// staggerStepMs  — delay between each character starting its reveal
// charRevealMs   — how long each character takes to fade in
// settleBufferMs — pause after the last character before navigating
export const ADMIN_LOGGING_ANIMATION_TIMING_MS = Object.freeze({
  staggerStepMs: 112,
  charRevealMs: 1480,
  settleBufferMs: 520,
});

/* -- Brand Glyphs -- */

// Each character of "[ CTH // BACKLINE ]" with its color tone.
// Tones: bracket (gray), main (primary), secondary, space (muted).
export const BACKLINE_SIGNING_GLYPHS = Object.freeze([
  { ch: '[', tone: 'bracket' },
  { ch: ' ', tone: 'space' },
  { ch: 'C', tone: 'secondary' },
  { ch: 'T', tone: 'main' },
  { ch: 'H', tone: 'secondary' },
  { ch: ' ', tone: 'space' },
  { ch: '/', tone: 'main' },
  { ch: '/', tone: 'main' },
  { ch: ' ', tone: 'space' },
  { ch: 'B', tone: 'secondary' },
  { ch: 'A', tone: 'main' },
  { ch: 'C', tone: 'secondary' },
  { ch: 'K', tone: 'main' },
  { ch: 'L', tone: 'secondary' },
  { ch: 'I', tone: 'main' },
  { ch: 'N', tone: 'secondary' },
  { ch: 'E', tone: 'main' },
  { ch: ' ', tone: 'space' },
  { ch: ']', tone: 'bracket' },
]);

/* -- Derived Constants -- */

// Total overlay duration: last char's stagger + reveal + settle buffer.
// Used in setTimeout calls to hold the overlay before navigating.
export const ADMIN_LOGGING_ANIMATION_HOLD_MS =
  Math.max(BACKLINE_SIGNING_GLYPHS.length - 1, 0) *
    ADMIN_LOGGING_ANIMATION_TIMING_MS.staggerStepMs +
  ADMIN_LOGGING_ANIMATION_TIMING_MS.charRevealMs +
  ADMIN_LOGGING_ANIMATION_TIMING_MS.settleBufferMs;

// Session key set on logout so the login page knows to play the
// brand stagger once. Removed after playback so it only fires once.
export const BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY = 'cth-admin-backline-signing-post-logout';
