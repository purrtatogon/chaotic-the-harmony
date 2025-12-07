/**
 * AdminLoggingInAndOutAnimation
 *
 * Animated overlay for admin login/logout. Staggers "[ CTH // BACKLINE ]"
 * one character at a time, then shows a status message with animated dots.
 *
 * Exports:
 *   .Brand / .Announcement / .Overlay / .LoginOverlay / .Loading
 *   AdminLoading (named export for pages that only need the loader)
 */
import {
  ADMIN_LOGGING_ANIMATION_TIMING_MS as TIMING_MS,
  BACKLINE_SIGNING_GLYPHS,
} from './adminLoggingInAndOutAnimation.model';

/* -- Constants -- */

// Stagger delays for each of the three animated dots (ms)
const DOT_DELAYS_MS = [0, 300, 600];

// Maps glyph "tone" values to their CSS Module class names
const TONE_CLASSES = {
  bracket: 'adminThinkingCharBracket',
  main: 'adminThinkingCharMain',
  secondary: 'adminThinkingCharSecondary',
  space: 'adminThinkingCharSpace',
};

// CSS class sets for the two overlay layouts
const OVERLAY_CLASSES = {
  full: {
    wrapper: 'adminSigningOverlay',
    card: 'adminSigningOverlayCard',
    status: 'adminSigningOverlayStatus',
  },
  embedded: {
    wrapper: 'adminSigningOverlayEmbedded',
    card: 'adminSigningOverlayEmbeddedInner',
    status: 'adminSigningOverlayEmbeddedStatus',
  },
};

/* -- Internal Components -- */

// Three dots that fade in one at a time on a loop (aria-hidden — the
// overlay's live region handles the screen reader announcement).
function AnimatedDots({ styles }) {
  return (
    <span
      className={styles.adminSigningDotsWrap}
      aria-hidden="true"
      data-testid="signing-animated-dots"
    >
      {DOT_DELAYS_MS.map((delay, i) => (
        <span
          key={i}
          className={styles.adminSigningDot}
          style={{ animationDelay: `${delay}ms` }}
        >
          .
        </span>
      ))}
    </span>
  );
}

// Renders "[ CTH // BACKLINE ]" with per-character stagger animation.
// Each character's delay = index × staggerStepMs.
function SigningBrand({ styles, active, variant = 'title', className = '' }) {
  const wrapClass = [
    styles.adminThinkingBrandWrap,
    variant === 'overlay' && styles.adminThinkingBrandWrapOverlay,
    active && styles.adminThinkingBrandWrapActive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={wrapClass}
      aria-hidden={active ? 'true' : undefined}
      // Passes reveal duration to CSS so JS timing stays in sync
      style={active ? { '--admin-thinking-char-duration': `${TIMING_MS.charRevealMs}ms` } : undefined}
    >
      {BACKLINE_SIGNING_GLYPHS.map(({ ch, tone }, i) => (
        <span
          key={i}
          className={`${styles.adminThinkingChar} ${styles[TONE_CLASSES[tone] || TONE_CLASSES.space]}`}
          style={active ? { animationDelay: `${i * TIMING_MS.staggerStepMs}ms` } : undefined}
        >
          {/* Swap spaces for non-breaking spaces so they don't collapse */}
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

// Visually hidden live region for screen reader announcements.
function SigningAnnouncement({ active, children }) {
  if (!active) return null;
  return (
    <p className="srOnly" aria-live="polite">
      {children}
    </p>
  );
}

/* -- Overlay Components -- */

// Main overlay — full-screen for login/logout, inline for page loading.
// If visibleStatus ends with "..." the dots are animated separately.
// Changing brandReplayKey forces the stagger animation to replay.
function SigningOverlay({
  styles,
  active,
  overlayCardRef,
  visibleStatus = 'LOGGING YOU OUT...',
  brandReplayKey = 0,
  embedded = false,
}) {
  if (!active) return null;

  const layout = OVERLAY_CLASSES[embedded ? 'embedded' : 'full'];
  const hasDots = visibleStatus.endsWith('...');

  return (
    <div className={styles[layout.wrapper]} aria-busy="true">
      <div
        ref={overlayCardRef}
        className={styles[layout.card]}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
      >
        <SigningBrand
          key={`backline-signing-${brandReplayKey}`}
          styles={styles}
          active
          variant="overlay"
        />

        <p className={styles[layout.status]}>
          {hasDots ? visibleStatus.slice(0, -3) : visibleStatus}
          {hasDots && <AnimatedDots styles={styles} />}
        </p>
      </div>
    </div>
  );
}

// Wrapper that defaults visibleStatus to "LOGGING YOU IN..."
function SigningInOverlay(props) {
  return (
    <SigningOverlay
      {...props}
      visibleStatus={props.visibleStatus ?? 'LOGGING YOU IN...'}
    />
  );
}

/* -- Glyph Spinner -- */

const SPINNER_GLYPHS = [
  { ch: '[', className: 'adminLoadingGlyphA' },
  { ch: '//', className: 'adminLoadingGlyphB' },
  { ch: ']', className: 'adminLoadingGlyphC' },
];

function GlyphSpinner({ styles }) {
  return (
    <span className={styles.adminLoadingGlyphRow} aria-hidden="true">
      {SPINNER_GLYPHS.map(({ ch, className }) => (
        <span
          key={ch}
          className={`${styles.adminLoadingGlyph} ${styles[className]}`}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/* -- Exports -- */

// Embedded loading state — used directly by admin pages
export function AdminLoading({ styles, message = 'Loading.' }) {
  const hasDots = message.endsWith('...');

  return (
    <div className={styles.adminSigningOverlayEmbedded} aria-busy="true">
      <div
        className={styles.adminSigningOverlayEmbeddedInner}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
      >
        <GlyphSpinner styles={styles} />
        <p className={styles.adminSigningOverlayEmbeddedStatus}>
          {hasDots ? message.slice(0, -3) : message}
          {hasDots && <AnimatedDots styles={styles} />}
        </p>
      </div>
    </div>
  );
}

// Compound export grouping all animation pieces under one namespace
export const AdminLoggingInAndOutAnimation = Object.freeze({
  Brand: SigningBrand,
  Announcement: SigningAnnouncement,
  Overlay: SigningOverlay,
  LoginOverlay: SigningInOverlay,
  Loading: AdminLoading,
});
