// ─────────────────────────────────────────────────────────────
// Screens 1–3: Sign up · Welcome · Consent
// Each is a self-contained component sized to fit a 1280×860 artboard.
// ─────────────────────────────────────────────────────────────

const ARTBOARD_W = 1280;
const ARTBOARD_H = 860;

// Frame wrapper — gives every screen the cream paper + edge.
function Frame({ children, bg = ONB.paper }) {
  return (
    <div style={{
      width: ARTBOARD_W, height: ARTBOARD_H, background: bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: ONB.fontSans, color: ONB.ink, overflow: 'hidden',
      position: 'relative',
    }}>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 01 · SIGN UP
//    Split: editorial cream-paper panel on the left, focused form on the right.
// ═════════════════════════════════════════════════════════════
function ScreenSignup() {
  return (
    <div data-screen-label="01 Sign up" style={{
      width: ARTBOARD_W, height: ARTBOARD_H, display: 'grid',
      gridTemplateColumns: '1.05fr 1fr', background: ONB.paper,
      fontFamily: ONB.fontSans, color: ONB.ink, overflow: 'hidden',
    }}>
      {/* ─── Left: editorial panel ─── */}
      <aside style={{
        position: 'relative', background: ONB.paperDeep,
        padding: '40px 56px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', overflow: 'hidden',
      }}>
        {/* Subtle ledger lines, deep paper texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0 38px, ${ONB.hairlineSoft} 38px 39px)`,
        }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <OnbWordmark/>
          <span style={{
            fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: ONB.inkFaint,
          }}>Est. 2025 · North Carolina</span>
        </div>

        {/* Editorial centerpiece */}
        <div style={{ position: 'relative' }}>
          <p style={{
            margin: 0, fontSize: 10.5, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
          }}>The continuous estate plan</p>
          <h2 style={{
            margin: '20px 0 0', fontFamily: ONB.fontSerif, fontStyle: 'italic',
            fontWeight: 400, fontSize: 60, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: ONB.ink, maxWidth: 460,
          }}>
            Make sure what you built reaches the people you love.
          </h2>
          <p style={{
            margin: '28px 0 0', fontSize: 15, lineHeight: 1.7,
            color: ONB.inkSoft, maxWidth: 420,
          }}>
            A living record of what's yours, who it goes to, and what you want
            them to know — gathered with an agent who works at your pace and
            remembers everything.
          </p>
        </div>

        {/* Quiet, signed signal at the bottom */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24 }}>
          <OnbStatusPill dot={ONB.gold}>Attorney-reviewed</OnbStatusPill>
          <OnbStatusPill dot="#10B981">Encrypted end-to-end</OnbStatusPill>
        </div>
      </aside>

      {/* ─── Right: form ─── */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 56px', background: ONB.paper,
      }}>
        <div style={{ width: 380 }}>
          <p style={{
            margin: 0, fontSize: 10.5, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
          }}>Phase 01 / 06 · Account</p>
          <h1 style={{
            margin: '14px 0 0', fontFamily: ONB.fontSans, fontWeight: 500,
            fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.025em', color: ONB.ink,
          }}>
            Begin your{' '}
            <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>
              record
            </span>.
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: ONB.inkSoft, lineHeight: 1.55 }}>
            Three details to start. We'll go at your pace from here.
          </p>

          <div style={{ marginTop: 32, display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <OnbInput label="First name" value="Sydney" />
              <OnbInput label="Last name" value="Reynolds" />
            </div>
            <OnbInput label="Email address" type="email" value="sydney@reynoldsfamily.co" />
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a style={{ fontSize: 13, color: ONB.inkSoft, textDecoration: 'none' }}>
              Already have an account?{' '}
              <span style={{ color: ONB.indigo, borderBottom: `1px solid ${ONB.indigo}` }}>Sign in</span>
            </a>
            <OnbButton size="lg">Next</OnbButton>
          </div>

          <p style={{
            marginTop: 28, fontSize: 11.5, color: ONB.inkFaint, lineHeight: 1.6,
          }}>
            By continuing, you agree to our <a style={{ color: ONB.inkSoft, borderBottom: `1px solid ${ONB.hairline}` }}>Terms of Use</a> and acknowledge
            our <a style={{ color: ONB.inkSoft, borderBottom: `1px solid ${ONB.hairline}` }}>Privacy Policy</a>. We never sell your data.
          </p>
        </div>
      </section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 02 · WELCOME
//    Centered editorial copy with an agent voice indicator.
// ═════════════════════════════════════════════════════════════
function ScreenWelcome() {
  return (
    <Frame>
      <OnbPhaseHeader phase={1} phaseLabel="Welcome" step={1} stepCount={4}
        rightSlot={<OnbStatusPill dot="#10B981">Encrypted</OnbStatusPill>}/>
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 96px',
      }}>
        <div style={{ maxWidth: 680, width: '100%' }}>
          {/* Voice indicator — an agent introduces herself */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            padding: '8px 14px 8px 8px', borderRadius: 999,
            background: ONB.card, border: `1px solid ${ONB.hairline}`,
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `linear-gradient(135deg, ${ONB.indigo}, #5852F5)`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#FCFAF5', fontFamily: ONB.fontSerif, fontStyle: 'italic',
              fontSize: 17,
            }}>A</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                {[6, 11, 8, 13, 5, 9].map((h, i) => (
                  <span key={i} style={{
                    width: 2, height: h, background: ONB.indigo, opacity: 0.85, borderRadius: 2,
                  }}/>
                ))}
              </span>
              <span style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: ONB.inkSoft, fontWeight: 500,
              }}>Ava is speaking</span>
            </span>
          </div>

          <h1 style={{
            margin: '32px 0 0', fontFamily: ONB.fontSans, fontWeight: 500,
            fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.03em', color: ONB.ink,
          }}>
            Hi Sydney,{' '}
            <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>
              welcome
            </span>.
          </h1>

          <div style={{ marginTop: 30, display: 'grid', gap: 18, maxWidth: 560 }}>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: ONB.ink }}>
              I'm Ava. Over the next while, you and I are going to build a
              record of what you've gathered — and who you want it to reach.
            </p>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: ONB.inkSoft }}>
              We'll move at your pace. Skip what you're not ready for; I'll
              hold onto the rest. I remember everything you tell me — so you
              never have to repeat yourself.
            </p>
          </div>

          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 20 }}>
            <OnbButton size="lg">Let's begin</OnbButton>
            <span style={{ fontSize: 13, color: ONB.inkFaint }}>
              About 12 minutes · pause anytime
            </span>
          </div>
        </div>
      </main>
      <OnbFooter/>
    </Frame>
  );
}

// ═════════════════════════════════════════════════════════════
// 03 · CONSENT
//    Two-column promise/ask grid. No legalese theater — clean.
// ═════════════════════════════════════════════════════════════
function ScreenConsent() {
  const promises = [
    { t: 'We encrypt everything', d: 'Your record is encrypted on our servers and on your device. Not even our team reads it.' },
    { t: 'We never sell your data', d: "No advertising, no brokers, no partners. The product is paid for by you, not by your information." },
    { t: 'Nothing leaves without you', d: 'We do not share with family, attorneys, or beneficiaries unless you explicitly direct us to.' },
    { t: 'You can take it with you', d: 'Export your full record as a portable document anytime. Close your account and we delete it.' },
  ];
  const asks = [
    { t: 'Tell us what is true', d: 'Names, dates, accounts. Best as you know them — we will help you reach the right detail later.' },
    { t: 'Keep your sign-in safe', d: 'Use a real phone number or authenticator app. This is the lock on the cabinet.' },
    { t: 'Update when life changes', d: 'A marriage, a birth, a new home. A few minutes from you keeps the record honest.' },
  ];
  return (
    <Frame>
      <OnbPhaseHeader phase={1} phaseLabel="Consent" step={2} stepCount={4}/>
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '56px 96px 36px' }}>
        <div style={{ maxWidth: 980, width: '100%' }}>
          <p style={{
            margin: 0, fontSize: 10.5, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
          }}>Before we start</p>
          <h1 style={{
            margin: '12px 0 0', fontFamily: ONB.fontSans, fontWeight: 500,
            fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.025em', color: ONB.ink, maxWidth: 760,
          }}>
            What we{' '}
            <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>promise</span>,
            and what we{' '}
            <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>ask</span> back.
          </h1>

          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48 }}>
            {/* PROMISES */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                paddingBottom: 12, borderBottom: `1px solid ${ONB.hairline}`,
              }}>
                <h3 style={{ margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ONB.ink, fontWeight: 600 }}>
                  Our promise
                </h3>
                <span style={{ fontSize: 11, letterSpacing: '0.16em', color: ONB.inkFaint }}>{promises.length} items</span>
              </div>
              <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                {promises.map((p, i) => (
                  <li key={i} style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12,
                    padding: '18px 0', borderBottom: `1px solid ${ONB.hairlineSoft}`,
                  }}>
                    <span style={{
                      fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 18,
                      color: ONB.indigo, lineHeight: 1, paddingTop: 2,
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: ONB.ink, letterSpacing: '-0.005em' }}>{p.t}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 13.5, color: ONB.inkSoft, lineHeight: 1.55 }}>{p.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* ASKS */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                paddingBottom: 12, borderBottom: `1px solid ${ONB.hairline}`,
              }}>
                <h3 style={{ margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ONB.ink, fontWeight: 600 }}>
                  In return, we ask
                </h3>
                <span style={{ fontSize: 11, letterSpacing: '0.16em', color: ONB.inkFaint }}>{asks.length} items</span>
              </div>
              <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                {asks.map((p, i) => (
                  <li key={i} style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12,
                    padding: '18px 0', borderBottom: `1px solid ${ONB.hairlineSoft}`,
                  }}>
                    <span style={{
                      fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 18,
                      color: ONB.gold, lineHeight: 1, paddingTop: 2,
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: ONB.ink, letterSpacing: '-0.005em' }}>{p.t}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 13.5, color: ONB.inkSoft, lineHeight: 1.55 }}>{p.d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Acceptance box */}
              <div style={{
                marginTop: 28, padding: 20, borderRadius: 12,
                border: `1px solid ${ONB.hairline}`, background: ONB.card,
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `1.5px solid ${ONB.ink}`, background: ONB.ink,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="#FCFAF5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span style={{ fontSize: 13.5, color: ONB.ink, lineHeight: 1.55 }}>
                    I've read and accept how Kinnected handles my information.
                  </span>
                </label>
              </div>

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <OnbButton size="lg">I understand, let's continue</OnbButton>
              </div>
            </div>
          </div>
        </div>
      </main>
      <OnbFooter/>
    </Frame>
  );
}

Object.assign(window, { Frame, ARTBOARD_W, ARTBOARD_H, ScreenSignup, ScreenWelcome, ScreenConsent });
