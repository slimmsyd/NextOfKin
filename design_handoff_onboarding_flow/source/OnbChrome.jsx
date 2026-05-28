// ─────────────────────────────────────────────────────────────
// Onboarding chrome — shared primitives for the v1 flow board.
// Aesthetic: cream paper + ink + sparse indigo accent. Wealth-platform
// editorial energy, not consumer-app gradient energy.
// ─────────────────────────────────────────────────────────────

const ONB = {
  paper:        '#F4EFE6',   // warm cream — the page itself
  paperDeep:    '#EDE6D7',   // panel cream (one tone darker)
  card:         '#FCFAF5',   // card/paper-white
  ink:          '#13131A',   // primary text
  inkSoft:      '#5C5A5A',   // body / supporting
  inkFaint:     '#8E8B85',   // captions, meta
  hairline:     'rgba(19,19,26,0.10)',
  hairlineSoft: 'rgba(19,19,26,0.06)',
  indigo:       '#3B35C3',   // sparing accent — brand-indigo-700
  indigoTint:   'rgba(59,53,195,0.06)',
  gold:         '#A98032',   // micro accent (notary feel)
  fontSans:     "'Inter', -apple-system, system-ui, sans-serif",
  fontSerif:    "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
};

// ── Wordmark — the kerned ligature "K" with the brand name.
function OnbWordmark({ tone = 'ink' }) {
  const color = tone === 'ink' ? ONB.ink : '#FCFAF5';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color, fontFamily: ONB.fontSans }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <ellipse cx="9" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 9 12)" stroke={color} strokeWidth="1.6"/>
        <ellipse cx="15" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 15 12)" stroke={color} strokeWidth="1.6"/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Kinnected</span>
    </div>
  );
}

// ── Top phase header — the financial-platform-style chrome.
//    Shows: wordmark / "Phase N of 6 · LABEL" / step or rightSlot, with a
//    hairline progress bar below.
function OnbPhaseHeader({
  phase = 1,
  phaseLabel = 'Welcome',
  totalPhases = 6,
  step,
  stepCount,
  rightSlot,
  progress, // 0..1 explicit override
}) {
  const hasStep = typeof step === 'number' && typeof stepCount === 'number';
  const pct = progress != null ? progress : (hasStep ? step / stepCount : 0);
  return (
    <header style={{
      width: '100%', background: 'rgba(244,239,230,0.92)', backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${ONB.hairline}`,
      fontFamily: ONB.fontSans,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 36px', gap: 24,
      }}>
        <OnbWordmark/>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: ONB.inkSoft, fontWeight: 500,
        }}>
          <span style={{ color: ONB.inkFaint }}>Phase {String(phase).padStart(2,'0')} / {String(totalPhases).padStart(2,'0')}</span>
          <span style={{ width: 4, height: 4, borderRadius: 4, background: ONB.indigo, opacity: 0.65 }}/>
          <span style={{ color: ONB.ink }}>{phaseLabel}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, minWidth: 120, justifyContent: 'flex-end' }}>
          {rightSlot ?? (hasStep ? (
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: ONB.inkFaint }}>
              Step {step} of {stepCount}
            </span>
          ) : null)}
        </div>
      </div>
      <div style={{ height: 1, background: ONB.hairlineSoft, position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${Math.round(pct * 100)}%`,
          background: ONB.ink, height: 1,
        }}/>
      </div>
    </header>
  );
}

// ── Footer — quiet encryption assurance line.
function OnbFooter({ note = 'End-to-end encrypted. Your data, your direction.' }) {
  return (
    <div style={{
      borderTop: `1px solid ${ONB.hairlineSoft}`,
      padding: '14px 36px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: ONB.fontSans, fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: ONB.inkFaint,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="9" rx="1.5" stroke={ONB.inkFaint} strokeWidth="1.6"/>
          <path d="M9 11V8a3 3 0 0 1 6 0v3" stroke={ONB.inkFaint} strokeWidth="1.6"/>
        </svg>
        {note}
      </span>
      <span>NC · V1 · ATTORNEY-REVIEWED</span>
    </div>
  );
}

// ── Editorial display heading. Inter for the lead, Instrument Serif italic
//    for the accent word — same shape as the codebase pattern.
function OnbDisplay({ children, accent, after = '', size = 'lg' }) {
  const sizes = { lg: 56, md: 46, sm: 38 };
  return (
    <h1 style={{
      margin: 0, fontFamily: ONB.fontSans, color: ONB.ink,
      fontSize: sizes[size], lineHeight: 1.04, letterSpacing: '-0.025em',
      fontWeight: 500, textWrap: 'pretty',
    }}>
      {children}
      {accent ? (
        <>
          {' '}
          <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo, letterSpacing: '-0.01em' }}>
            {accent}
          </span>
        </>
      ) : null}
      {after}
    </h1>
  );
}

// ── Primary CTA — solid ink pill, cream type. Wealth feel: assertive, restrained.
function OnbButton({ children, variant = 'primary', size = 'md', icon, disabled, style }) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const pads = size === 'lg' ? '14px 28px' : '11px 22px';
  return (
    <button type="button" disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: pads, borderRadius: 999, fontFamily: ONB.fontSans,
      fontSize: size === 'lg' ? 14 : 13, fontWeight: 500, letterSpacing: '0.01em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: isPrimary ? ONB.ink : 'transparent',
      color: isPrimary ? '#FCFAF5' : ONB.ink,
      border: isPrimary ? '1px solid ' + ONB.ink : (isGhost ? '1px solid transparent' : `1px solid ${ONB.hairline}`),
      boxShadow: isPrimary ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 18px rgba(19,19,26,0.18)' : 'none',
      opacity: disabled ? 0.45 : 1,
      transition: 'transform 200ms ease',
      ...style,
    }}>
      {children}
      {icon !== false ? (
        <span aria-hidden style={{ display: 'inline-flex', transform: 'translateY(0.5px)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : null}
    </button>
  );
}

// ── Field input — pill-less, hairline, big tap target.
function OnbInput({ label, value, placeholder, hint, suffix, type = 'text', autosaved }) {
  return (
    <label style={{ display: 'block', fontFamily: ONB.fontSans }}>
      {label ? (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: ONB.inkFaint, fontWeight: 500, marginBottom: 8,
        }}>
          <span>{label}</span>
          {autosaved ? <span style={{ color: ONB.gold, letterSpacing: '0.16em' }}>· SAVED</span> : null}
        </span>
      ) : null}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', background: ONB.card,
        border: `1px solid ${ONB.hairline}`, borderRadius: 10,
      }}>
        <input
          type={type} defaultValue={value} placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: ONB.fontSans, fontSize: 15, color: ONB.ink, letterSpacing: '-0.005em',
            minWidth: 0,
          }}
        />
        {suffix ? <span style={{ fontSize: 12, color: ONB.inkFaint }}>{suffix}</span> : null}
      </div>
      {hint ? <p style={{ margin: '6px 0 0', fontSize: 12, color: ONB.inkFaint }}>{hint}</p> : null}
    </label>
  );
}

// ── Select with chevron.
function OnbSelect({ label, value, placeholder = 'Select', options = [], autosaved }) {
  return (
    <label style={{ display: 'block', fontFamily: ONB.fontSans }}>
      {label ? (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: ONB.inkFaint, fontWeight: 500, marginBottom: 8,
        }}>
          <span>{label}</span>
          {autosaved ? <span style={{ color: ONB.gold, letterSpacing: '0.16em' }}>· SAVED</span> : null}
        </span>
      ) : null}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', background: ONB.card,
        border: `1px solid ${ONB.hairline}`, borderRadius: 10,
      }}>
        <span style={{ flex: 1, fontSize: 15, color: value ? ONB.ink : ONB.inkFaint }}>
          {value || placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke={ONB.inkFaint} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </label>
  );
}

// ── A status pill used in headers — "AUTOSAVED 23s AGO", "LIVE", etc.
function OnbStatusPill({ children, dot = ONB.gold }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '5px 10px', borderRadius: 999, background: 'rgba(19,19,26,0.04)',
      fontFamily: ONB.fontSans, fontSize: 10.5, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: ONB.inkSoft, fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: dot }}/>
      {children}
    </span>
  );
}

Object.assign(window, {
  ONB, OnbWordmark, OnbPhaseHeader, OnbFooter, OnbDisplay,
  OnbButton, OnbInput, OnbSelect, OnbStatusPill,
});
