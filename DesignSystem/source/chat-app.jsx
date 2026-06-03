// ─────────────────────────────────────────────────────────────
// Recommended next-question bubbles — interactive lavender chat.
// Two placements (Inline / Composer dock), tap fills the composer,
// send → Ava replies → a fresh set of suggestions generates.
// ─────────────────────────────────────────────────────────────

const LAV = {
  page:        '#EFEDFB',          // soft lavender page
  pageDeep:    '#E7E3F6',
  aiBubble:    '#F4F2FC',          // agent message bubble
  card:        '#FFFFFF',
  ink:         '#1A1830',          // primary text (violet-black)
  inkSoft:     '#56546F',
  inkFaint:    '#8E8CA8',
  hairline:    'rgba(34,30,68,0.09)',
  hairlineSoft:'rgba(34,30,68,0.055)',
  violet:      '#5852F5',
  indigoDeep:  '#3B35C3',
  recBorder:   'rgba(88,82,245,0.20)',
  recHover:    '#F2F0FF',
  fontSans:    "'Inter', -apple-system, system-ui, sans-serif",
  fontSerif:   "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
};

// ── Conversation seed — picks up mid-flow, matching the reference. ──
const SEED = [
  { role: 'ai', text: "I hear you. You want this home to go to your son, Atlas.\n\nDo you have a will or trust already written that names Atlas for this house?" },
  { role: 'user', text: "We don't have a trust or will created." },
  { role: 'ai', text: "That makes sense. Since you want Atlas to have the house, we can make that clear as we go. A will or trust is something a lawyer can help you set up when you're ready.\n\nFor now, let's keep building your record. What other things that matter to you should we include?" },
];

// ── Suggestion sets + Ava's replies, cycled each turn. ──
const SUGGESTION_SETS = [
  [
    "What else should we include besides the house?",
    "Can you help me draft a simple template?",
    "How do I make sure Atlas actually gets it?",
    "What happens if we never make a will?",
  ],
  [
    "Who should I name as a backup for Atlas?",
    "Does my spouse need to agree to this?",
    "Can I change any of this later?",
    "What does a lawyer actually do here?",
  ],
  [
    "Add my car and savings to the record",
    "What about my mother's ring?",
    "How private is everything I tell you?",
    "Remind me what's still left to cover",
  ],
  [
    "Let's keep going to the next section",
    "Summarize what we have so far",
    "I want to name a guardian for Atlas",
    "What happens to all this when I'm gone?",
  ],
];

const AVA_REPLIES = [
  "Good — I've noted that. The clearer your wishes are here, the simpler the legal step becomes later. Want to keep going while it's fresh?",
  "Done. I've added it to your record on the right. Is there anyone else who should be part of this?",
  "Got it, and kept private. We're building a real picture of what matters to you. Shall we move on, or is there more here?",
  "Perfect. That's all captured. We can pick up the next section whenever you're ready.",
];

// ── A single suggestion bubble. Visibility is driven by committed React
//    state (`revealed`) so it never depends on the animation engine running;
//    transitions only add the motion (and collapse under reduced-motion). ──
function Suggestion({ children, index, anim, accent, variant, revealed, onClick }) {
  const base = anim === 'Typing' ? 240 : 0;
  const stride = anim === 'Pop' ? 70 : 90;
  const delay = base + index * stride;
  const hidden = anim === 'Pop' ? 'scale(0.88)' : 'translateY(10px)';
  const ease = anim === 'Pop' ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'cubic-bezier(0.16,1,0.3,1)';
  const isDock = variant === 'dock';
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'none' : hidden,
        transition: revealed
          ? `transform 460ms ${ease} ${delay}ms, border-color 200ms ease, background 200ms ease, box-shadow 200ms ease`
          : 'none',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: LAV.fontSans,
        display: isDock ? 'flex' : 'inline-flex',
        alignItems: isDock ? 'flex-start' : 'center',
        gap: 10,
        width: isDock ? '100%' : 'auto',
        padding: isDock ? '13px 15px' : '11px 16px',
        borderRadius: 14,
        background: hover ? LAV.recHover : LAV.card,
        border: `1px solid ${hover ? accent : LAV.recBorder}`,
        boxShadow: hover
          ? `0 8px 20px ${hexA(accent, 0.18)}`
          : '0 1px 2px rgba(34,30,68,0.04)',
        color: LAV.ink,
        fontSize: 14,
        lineHeight: 1.4,
        fontWeight: 450,
      }}
    >
      {isDock ? (
        <span style={{
          flexShrink: 0, marginTop: 1,
          width: 22, height: 22, borderRadius: 7,
          background: hexA(accent, 0.10),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SparkIcon color={accent} size={12}/>
        </span>
      ) : null}
      <span style={{ flex: 1 }}>{children}</span>
      {!isDock ? (
        <span style={{
          flexShrink: 0, color: accent, opacity: 0.7,
          display: 'inline-flex', transform: 'translateY(0.5px)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : null}
    </button>
  );
}

function SparkIcon({ color = '#5852F5', size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" fill={color}/>
    </svg>
  );
}

// ── The recommended-questions block, rendered in either placement. ──
function Suggestions({ items, genId, anim, accent, variant, revealed, onPick }) {
  if (!items.length) return null;

  const label = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: LAV.inkFaint, fontWeight: 600, marginBottom: 12,
    }}>
      <SparkIcon color={accent} size={12}/>
      Recommended next questions
    </div>
  );

  if (variant === 'dock') {
    return (
      <div key={genId} style={{ padding: '14px 0 4px' }}>
        {label}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {items.map((q, i) => (
            <Suggestion key={`${genId}-${i}`} index={i} anim={anim} accent={accent} variant="dock"
              revealed={revealed} onClick={() => onPick(q)}>{q}</Suggestion>
          ))}
        </div>
      </div>
    );
  }

  // inline — indented under the agent column
  return (
    <div key={genId} style={{ marginLeft: 46, maxWidth: 600 }}>
      {label}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map((q, i) => (
          <Suggestion key={`${genId}-${i}`} index={i} anim={anim} accent={accent} variant="inline"
            revealed={revealed} onClick={() => onPick(q)}>{q}</Suggestion>
        ))}
      </div>
    </div>
  );
}

// ── Message bubbles ──────────────────────────────────────────
function AgentMsg({ text }) {
  const paras = text.split('\n\n');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, maxWidth: 640 }}>
      <Avatar/>
      <div style={{
        padding: '14px 18px', borderRadius: 16, borderTopLeftRadius: 5,
        background: LAV.aiBubble,
        boxShadow: '0 1px 2px rgba(34,30,68,0.04)',
        fontSize: 15, lineHeight: 1.6, color: LAV.ink,
      }}>
        {paras.map((p, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0' }}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function UserMsg({ text, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 460, padding: '13px 18px', borderRadius: 16, borderTopRightRadius: 5,
        background: `linear-gradient(135deg, ${accent}, ${shade(accent, -8)})`,
        color: '#FFFFFF', fontSize: 15, lineHeight: 1.5, fontWeight: 450,
        boxShadow: `0 6px 18px ${hexA(accent, 0.22)}`,
      }}>{text}</div>
    </div>
  );
}

function Avatar({ size = 32 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${LAV.violet}, ${LAV.indigoDeep})`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#FFFFFF', fontFamily: LAV.fontSerif, fontStyle: 'italic',
      fontSize: size * 0.46, flexShrink: 0,
    }}>A</span>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14 }}>
      <Avatar/>
      <div style={{
        padding: '16px 18px', borderRadius: 16, borderTopLeftRadius: 5,
        background: LAV.aiBubble, display: 'inline-flex', alignItems: 'center', gap: 5,
        width: 'fit-content',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: LAV.inkFaint,
            animation: `recq-bounce 1.2s ${i * 0.16}s infinite ease-in-out`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── Right rail — the record being built (context) ──
function RecordRail({ accent, extra }) {
  return (
    <aside style={{
      width: 360, flexShrink: 0, background: LAV.card,
      borderLeft: `1px solid ${LAV.hairlineSoft}`,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      <div style={{
        padding: '22px 26px', borderBottom: `1px solid ${LAV.hairlineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: LAV.inkFaint, fontWeight: 600 }}>Your record</p>
          <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 600, color: LAV.ink }}>The Bennett home</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 999,
          background: hexA(accent, 0.08), fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: accent, fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: accent }}/>Live
        </span>
      </div>

      <div style={{ padding: '22px 26px', display: 'grid', gap: 24 }}>
        <RailBlock accent={accent} title="What you're leaving" items={[
          ['The house', '128 Maple Row'],
          ['Goes to', 'Atlas, his son'],
          ['Form', 'Will pending'],
        ]} highlight/>
        <RailBlock accent={accent} title="Who you protect" items={[
          ['Son', 'Atlas, 14'],
          ['Backup', extra ? 'Aunt Dana' : 'Not set yet'],
        ]}/>
        <RailBlock accent={accent} title="Your wishes" items={
          extra
            ? [['Note', 'Keep it in the family']]
            : [['Note', 'Nothing added yet']]
        }/>

        <div style={{
          padding: 15, borderRadius: 12, background: LAV.page,
          border: `1px dashed ${LAV.hairline}`,
        }}>
          <p style={{ margin: 0, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: LAV.inkFaint, fontWeight: 600 }}>Coming up</p>
          <p style={{ margin: '7px 0 0', fontSize: 13, color: LAV.inkSoft, lineHeight: 1.5 }}>
            Savings, keepsakes, and the people who should know. No paperwork needed yet — just talk to Ava.
          </p>
        </div>
      </div>
    </aside>
  );
}

function RailBlock({ title, items, accent, highlight }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        paddingBottom: 8, borderBottom: `1px solid ${LAV.hairline}`,
      }}>
        <h3 style={{ margin: 0, fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: LAV.ink, fontWeight: 700 }}>{title}</h3>
        {highlight ? (
          <span style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, fontWeight: 600 }}>Building…</span>
        ) : null}
      </div>
      <dl style={{ margin: '9px 0 0', display: 'grid', gap: 7 }}>
        {items.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
            <dt style={{ fontSize: 12.5, color: LAV.inkFaint, flexShrink: 0 }}>{k}</dt>
            <dd style={{ margin: 0, fontSize: 13, color: LAV.ink, fontWeight: 500, textAlign: 'right', lineHeight: 1.4, whiteSpace: 'nowrap' }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Variation switch (always visible, clearly a preview control) ──
function VariantSwitch({ value, onChange, accent }) {
  const opts = [['inline', 'Inline'], ['dock', 'Composer dock']];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4,
      borderRadius: 999, background: LAV.page, border: `1px solid ${LAV.hairline}`,
    }}>
      {opts.map(([val, label]) => {
        const on = value === val;
        return (
          <button key={val} type="button" onClick={() => onChange(val)} style={{
            border: 'none', cursor: 'pointer', fontFamily: LAV.fontSans,
            padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.01em',
            background: on ? LAV.card : 'transparent',
            color: on ? accent : LAV.inkFaint,
            boxShadow: on ? '0 1px 3px rgba(34,30,68,0.10)' : 'none',
            transition: 'all 180ms ease',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Main app
// ═════════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "inline",
  "count": 4,
  "animation": "Stagger",
  "accent": "#5852F5",
  "showRail": true
}/*EDITMODE-END*/;

function RecQApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = t.accent || '#5852F5';
  const variant = t.variant || 'inline';
  const count = Math.max(2, Math.min(4, t.count || 4));
  const anim = t.animation || 'Stagger';

  const [messages, setMessages] = React.useState(SEED);
  const [suggestions, setSuggestions] = React.useState(SUGGESTION_SETS[0].slice(0, count));
  const [genId, setGenId] = React.useState(1);
  const [revealed, setRevealed] = React.useState(true);
  const [turn, setTurn] = React.useState(0);
  const [typing, setTyping] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [sentCount, setSentCount] = React.useState(0);

  const inputRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const timers = React.useRef([]);
  const firstRun = React.useRef(true);

  // Re-trigger the staggered entrance. Uses a standalone timer (not an effect
  // cleanup) so a re-render can never clear it and leave pills hidden.
  function restagger() {
    setRevealed(false);
    const id = setTimeout(() => setRevealed(true), 60);
    timers.current.push(id);
  }

  // keep the suggestion count in sync with the tweak (skip the entrance blip on
  // first mount — pills start fully visible)
  React.useEffect(() => {
    setSuggestions(SUGGESTION_SETS[turn % SUGGESTION_SETS.length].slice(0, count));
    if (firstRun.current) { firstRun.current = false; return; }
    setGenId(g => g + 1);
    restagger();
  }, [count]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };
  React.useEffect(scrollDown, [messages, typing, genId, variant]);

  function pick(text) {
    setDraft(text);
    if (inputRef.current) {
      inputRef.current.focus();
      // nudge cursor to end
      const v = inputRef.current.value;
      inputRef.current.value = '';
      inputRef.current.value = text;
    }
  }

  function send() {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft('');
    setSuggestions([]);
    setMessages(m => [...m, { role: 'user', text }]);
    setSentCount(c => c + 1);
    setTyping(true);
    scrollDown();

    const nextTurn = turn + 1;
    const reply = AVA_REPLIES[turn % AVA_REPLIES.length];
    const nextSet = SUGGESTION_SETS[nextTurn % SUGGESTION_SETS.length].slice(0, count);

    const id1 = setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'ai', text: reply }]);
      const id2 = setTimeout(() => {
        setTurn(nextTurn);
        setSuggestions(nextSet);
        setGenId(g => g + 1);
        restagger();
      }, 260);
      timers.current.push(id2);
    }, 1100);
    timers.current.push(id1);
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      background: LAV.page, fontFamily: LAV.fontSans, color: LAV.ink,
    }}>
      {/* Conversation column */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <header style={{
          padding: '16px 32px', borderBottom: `1px solid ${LAV.hairlineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          background: hexA('#FFFFFF', 0.55), backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <Avatar size={40}/>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: LAV.ink }}>Ava · your guide</p>
              <p style={{ margin: '1px 0 0', fontSize: 12, color: LAV.inkFaint, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: '#10B981' }}/>
                Listening · remembers everything
              </p>
            </div>
          </div>
          <VariantSwitch value={variant} onChange={(v) => setTweak('variant', v)} accent={accent}/>
        </header>

        {/* thread */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 8px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: LAV.inkFaint,
            }}>
              <span style={{ flex: 1, height: 1, background: LAV.hairlineSoft }}/>
              Today · 3:14 PM
              <span style={{ flex: 1, height: 1, background: LAV.hairlineSoft }}/>
            </div>

            {messages.map((m, i) => (
              m.role === 'ai'
                ? <AgentMsg key={i} text={m.text}/>
                : <UserMsg key={i} text={m.text} accent={accent}/>
            ))}

            {typing ? <TypingDots/> : null}

            {/* inline suggestions live in the thread, after the last AI message */}
            {variant === 'inline' && !typing ? (
              <Suggestions items={suggestions} genId={genId} anim={anim}
                accent={accent} variant="inline" revealed={revealed} onPick={pick}/>
            ) : null}

            <div style={{ height: 4 }}/>
          </div>
        </div>

        {/* composer area */}
        <div style={{ borderTop: `1px solid ${LAV.hairlineSoft}`, padding: '0 32px 22px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* dock suggestions sit just above the input */}
            {variant === 'dock' && !typing ? (
              <Suggestions items={suggestions} genId={genId} anim={anim}
                accent={accent} variant="dock" revealed={revealed} onPick={pick}/>
            ) : null}

            <div style={{
              marginTop: variant === 'dock' ? 12 : 18,
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 8px 8px 20px', borderRadius: 18,
              background: LAV.card, border: `1px solid ${LAV.hairline}`,
              boxShadow: '0 4px 16px rgba(34,30,68,0.05)',
            }}>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type your answer, or tap a suggested question…"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: LAV.fontSans, fontSize: 15, color: LAV.ink, minWidth: 0,
                }}
              />
              <button type="button" aria-label="Voice" style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="3" width="6" height="12" rx="3" stroke={LAV.inkFaint} strokeWidth="1.7"/>
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={LAV.inkFaint} strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </button>
              <button type="button" aria-label="Send" onClick={send} style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: draft.trim() ? accent : hexA(accent, 0.5),
                border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms ease, transform 200ms ease',
                boxShadow: draft.trim() ? `0 6px 16px ${hexA(accent, 0.32)}` : 'none',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M6 11l6-6 6 6" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ margin: '10px 4px 0', fontSize: 11, color: LAV.inkFaint, textAlign: 'center' }}>
              Tap a recommended question to drop it in — edit it, then send. Ava remembers everything you say.
            </p>
          </div>
        </div>
      </main>

      {t.showRail ? <RecordRail accent={accent} extra={sentCount > 0}/> : null}

      {/* ── Tweaks ── */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Recommended questions"/>
        <TweakRadio label="Placement" value={variant}
          options={['inline', 'dock']}
          onChange={(v) => setTweak('variant', v)}/>
        <TweakSlider label="How many" value={count} min={2} max={4} step={1}
          onChange={(v) => setTweak('count', v)}/>
        <TweakRadio label="Entrance" value={anim}
          options={['Stagger', 'Pop', 'Typing']}
          onChange={(v) => setTweak('animation', v)}/>
        <TweakSection label="Look"/>
        <TweakColor label="Accent" value={accent}
          options={['#5852F5', '#4F46E5', '#7B61FF', '#3B35C3']}
          onChange={(v) => setTweak('accent', v)}/>
        <TweakToggle label="Show record rail" value={!!t.showRail}
          onChange={(v) => setTweak('showRail', v)}/>
        <TweakButton label="Reset conversation" onClick={() => {
          setMessages(SEED);
          setTurn(0);
          setSuggestions(SUGGESTION_SETS[0].slice(0, count));
          setGenId(g => g + 1);
          setSentCount(0);
          setDraft('');
          restagger();
        }}/>
      </TweaksPanel>
    </div>
  );
}

// ── tiny color helpers ──
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const clamp = (x) => Math.max(0, Math.min(255, x));
  const r = clamp(parseInt(h.slice(0, 2), 16) + amt);
  const g = clamp(parseInt(h.slice(2, 4), 16) + amt);
  const b = clamp(parseInt(h.slice(4, 6), 16) + amt);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(<RecQApp/>);
