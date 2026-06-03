// ─────────────────────────────────────────────────────────────
// Voice / live-transcription states for the Kinnected chat.
// Two switchable variations, both with a reactive waveform and
// word-by-word live captioning.
//   • VoiceImmersive — full-panel focus overlay (pulsing mic orb)
//   • VoiceInline    — composer morphs into a recording row + caption
// Self-contained palette (VLAV) so this file shares no top-level
// identifiers with chat-app.jsx (separate Babel scopes).
// ─────────────────────────────────────────────────────────────

const VLAV = {
  page:        '#EFEDFB',
  aiBubble:    '#F4F2FC',
  card:        '#FFFFFF',
  ink:         '#1A1830',
  inkSoft:     '#56546F',
  inkFaint:    '#8E8CA8',
  hairline:    'rgba(34,30,68,0.09)',
  hairlineSoft:'rgba(34,30,68,0.055)',
  fontSans:    "'Inter', -apple-system, system-ui, sans-serif",
  fontSerif:   "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
};

function vhexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function vshade(hex, amt) {
  const h = hex.replace('#', '');
  const clamp = (x) => Math.max(0, Math.min(255, x));
  const r = clamp(parseInt(h.slice(0, 2), 16) + amt);
  const g = clamp(parseInt(h.slice(2, 4), 16) + amt);
  const b = clamp(parseInt(h.slice(4, 6), 16) + amt);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// What the user is "saying" — a natural spoken answer for the demo.
const VOICE_TARGET =
  "I want to make sure my daughter Maya keeps the cabin up at the lake. " +
  "It's where we spend every summer, and I'd like it to stay in the family.";

// ── Simulated speech-to-text: reveals words on a cadence, with the
//    most recent word treated as an unconfirmed "interim" result. ──
function useDictation(active) {
  const words = React.useMemo(() => VOICE_TARGET.split(' '), []);
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setN(0); return; }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= words.length) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  const committed = words.slice(0, Math.max(0, n - 1)).join(' ');
  const interim = n > 0 ? words[Math.min(n, words.length) - 1] : '';
  const fullText = words.slice(0, n).join(' ');
  return { committed, interim, fullText, started: n > 0, done: n >= words.length };
}

// ── Elapsed mm:ss while recording ──
function useElapsed(active) {
  const [s, setS] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setS(0); return; }
    setS(0);
    const id = setInterval(() => setS(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const mm = String(Math.floor(s / 60)).padStart(1, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Reactive audio waveform (live-updating bar heights) ──
function Waveform({ accent, active, bars = 44, max = 56, min = 4, width }) {
  const [h, setH] = React.useState(() => Array.from({ length: bars }, () => min + 2));
  React.useEffect(() => {
    if (!active) { setH(Array.from({ length: bars }, () => min + 1)); return; }
    const id = setInterval(() => {
      setH(Array.from({ length: bars }, (_, i) => {
        const env = Math.sin((i / (bars - 1)) * Math.PI);      // tall in the middle
        const r = Math.random();
        return min + env * (max - min) * (0.30 + 0.70 * r);
      }));
    }, 90);
    return () => clearInterval(id);
  }, [active, bars, max, min]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 3, height: max, width: width || '100%',
    }}>
      {h.map((v, i) => (
        <span key={i} style={{
          width: 3, height: Math.max(min, v), borderRadius: 3, flexShrink: 0,
          background: accent,
          opacity: 0.45 + 0.55 * (v / max),
          transition: 'height 110ms ease, opacity 110ms ease',
        }}/>
      ))}
    </div>
  );
}

// ── Live caption text (committed words solid, interim word faded) ──
function Caption({ committed, interim, started, big, align = 'left' }) {
  if (!started) {
    return (
      <span style={{ color: VLAV.inkFaint, fontStyle: big ? 'italic' : 'normal',
        fontFamily: big ? VLAV.fontSerif : VLAV.fontSans,
        fontSize: big ? 30 : 15 }}>
        {big ? 'Listening… start speaking' : 'Listening…'}
      </span>
    );
  }
  return (
    <span style={{
      fontFamily: big ? VLAV.fontSerif : VLAV.fontSans,
      fontSize: big ? 30 : 15, lineHeight: big ? 1.4 : 1.5,
      color: VLAV.ink, textAlign: align, fontStyle: big ? 'italic' : 'normal',
      textWrap: 'pretty',
    }}>
      {committed}
      {committed ? ' ' : ''}
      <span style={{ color: VLAV.inkFaint }}>{interim}</span>
      <span style={{
        display: 'inline-block', width: big ? 3 : 2, height: big ? 28 : 16,
        marginLeft: 4, transform: 'translateY(3px)',
        background: VLAV.inkFaint, borderRadius: 2,
        animation: 'voice-caret 1s steps(1) infinite',
      }}/>
    </span>
  );
}

// ── Shared control buttons ──
function CancelBtn({ onClick, size = 52 }) {
  return (
    <button type="button" aria-label="Cancel" onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: VLAV.card, border: `1px solid ${VLAV.hairline}`, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(34,30,68,0.05)', transition: 'background 160ms ease',
    }}>
      <svg width={size * 0.34} height={size * 0.34} viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke={VLAV.inkSoft} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
function ConfirmBtn({ onClick, accent, size = 56, label }) {
  if (label) {
    return (
      <button type="button" onClick={onClick} style={{
        height: size, padding: '0 26px 0 22px', borderRadius: 999, flexShrink: 0,
        background: accent, border: 'none', cursor: 'pointer', color: '#FFFFFF',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: VLAV.fontSans, fontSize: 15, fontWeight: 600,
        boxShadow: `0 8px 22px ${vhexA(accent, 0.34)}`, transition: 'transform 160ms ease',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {label}
      </button>
    );
  }
  return (
    <button type="button" aria-label="Use answer" onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: accent, border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 22px ${vhexA(accent, 0.34)}`,
    }}>
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
// Variation A — Immersive focus overlay
// ═════════════════════════════════════════════════════════════
function VoiceImmersive({ accent, onCancel, onCommit }) {
  const { committed, interim, started, fullText } = useDictation(true);
  const elapsed = useElapsed(true);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: `radial-gradient(110% 80% at 50% 30%, ${vhexA(accent, 0.13)} 0%, ${vshade(VLAV.page, 4)} 46%, ${VLAV.page} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 40px 44px',
      animation: 'voice-overlay-in 280ms cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* status */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 6,
        padding: '8px 16px', borderRadius: 999, background: VLAV.card,
        border: `1px solid ${VLAV.hairline}`, boxShadow: '0 2px 8px rgba(34,30,68,0.05)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: '#EF4444',
          animation: 'voice-blink 1.3s ease infinite' }}/>
        <span style={{ fontFamily: VLAV.fontSans, fontSize: 12.5, fontWeight: 600,
          letterSpacing: '0.04em', color: VLAV.ink }}>Listening</span>
        <span style={{ fontFamily: VLAV.fontSans, fontSize: 12.5, color: VLAV.inkFaint,
          fontVariantNumeric: 'tabular-nums' }}>{elapsed}</span>
      </div>

      {/* mic orb with pulse rings */}
      <div style={{ position: 'relative', margin: 'auto 0 0', height: 132, width: 132,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
          background: vhexA(accent, 0.18), animation: 'voice-pulse 2.4s ease-out infinite' }}/>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
          background: vhexA(accent, 0.18), animation: 'voice-pulse 2.4s ease-out 1.2s infinite' }}/>
        <span style={{
          position: 'relative', width: 96, height: 96, borderRadius: '50%',
          background: `linear-gradient(140deg, ${accent}, ${vshade(accent, -26)})`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 18px 40px ${vhexA(accent, 0.4)}`,
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" stroke="#FFFFFF" strokeWidth="1.8"/>
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </span>
      </div>

      {/* waveform */}
      <div style={{ width: 'min(420px, 70%)', marginTop: 30 }}>
        <Waveform accent={accent} active bars={48} max={52}/>
      </div>

      {/* live transcript */}
      <div style={{
        maxWidth: 600, marginTop: 30, textAlign: 'center', minHeight: 96,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}>
        <Caption committed={committed} interim={interim} started={started} big align="center"/>
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: 'auto 0 0' }}>
        <CancelBtn onClick={onCancel} size={56}/>
        <ConfirmBtn accent={accent} label="Use this answer" size={56}
          onClick={() => onCommit(fullText || VOICE_TARGET)}/>
      </div>
      <p style={{ margin: '16px 0 0', fontFamily: VLAV.fontSans, fontSize: 12, color: VLAV.inkFaint }}>
        Speak naturally — tap <strong style={{ color: VLAV.inkSoft, fontWeight: 600 }}>Use this answer</strong> when you're done, then edit before sending.
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Variation B — Inline composer morph (returns the whole composer
// area inner: a caption card above + the recording row)
// ═════════════════════════════════════════════════════════════
function VoiceInline({ accent, onCancel, onCommit }) {
  const { committed, interim, started, fullText } = useDictation(true);
  const elapsed = useElapsed(true);

  return (
    <React.Fragment>
      {/* live caption card */}
      <div style={{
        marginBottom: 12, padding: '14px 18px', borderRadius: 16,
        background: VLAV.card, border: `1px solid ${VLAV.hairline}`,
        boxShadow: '0 4px 16px rgba(34,30,68,0.05)',
        animation: 'voice-rise 240ms ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: accent,
            animation: 'voice-blink 1.3s ease infinite' }}/>
          <span style={{ fontFamily: VLAV.fontSans, fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: VLAV.inkFaint }}>
            Transcribing
          </span>
        </div>
        <div style={{ minHeight: 44 }}>
          <Caption committed={committed} interim={interim} started={started}/>
        </div>
      </div>

      {/* recording row (replaces the input) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '8px 8px 8px 18px', borderRadius: 18,
        background: VLAV.card, border: `1px solid ${vhexA(accent, 0.45)}`,
        boxShadow: `0 0 0 4px ${vhexA(accent, 0.08)}, 0 4px 16px rgba(34,30,68,0.05)`,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: '#EF4444',
            animation: 'voice-blink 1.3s ease infinite' }}/>
          <span style={{ fontFamily: VLAV.fontSans, fontSize: 13, fontWeight: 600,
            color: VLAV.ink, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</span>
        </span>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Waveform accent={accent} active bars={40} max={34} min={3}/>
        </div>
        <CancelBtn onClick={onCancel} size={40}/>
        <ConfirmBtn accent={accent} size={44}
          onClick={() => onCommit(fullText || VOICE_TARGET)}/>
      </div>
      <p style={{ margin: '10px 4px 0', fontFamily: VLAV.fontSans, fontSize: 11,
        color: VLAV.inkFaint, textAlign: 'center' }}>
        Speak your answer — tap the check to drop the transcript into the composer, then edit before sending.
      </p>
    </React.Fragment>
  );
}

Object.assign(window, { VoiceImmersive, VoiceInline, Waveform });
