// ─────────────────────────────────────────────────────────────
// Screens 4–6: Protect · About you · Your life
// ─────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════════════════════
// 04 · PROTECT YOUR ACCOUNT — 2FA selection
// ═════════════════════════════════════════════════════════════
function ScreenProtect() {
  const options = [
    {
      key: 'sms',
      title: 'Text message',
      desc: "We'll send a 6-digit code to your phone each time you sign in.",
      recommended: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="6" y="3" width="12" height="18" rx="2.5" stroke={ONB.ink} strokeWidth="1.6"/>
          <line x1="10" y1="18" x2="14" y2="18" stroke={ONB.ink} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: 'app',
      title: 'Authenticator app',
      desc: 'Use 1Password, Authy, or Google Authenticator. Most secure option.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3.5" y="6" width="17" height="12" rx="1.5" stroke={ONB.ink} strokeWidth="1.6"/>
          <path d="M7 10l3 4 2-3 3 5" stroke={ONB.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <Frame>
      <OnbPhaseHeader phase={1} phaseLabel="Protect" step={3} stepCount={4}/>
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 96px' }}>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <p style={{
            margin: 0, fontSize: 10.5, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
          }}>Two-factor authentication</p>
          <h1 style={{
            margin: '14px 0 0', fontFamily: ONB.fontSans, fontWeight: 500,
            fontSize: 52, lineHeight: 1.04, letterSpacing: '-0.025em', color: ONB.ink,
            maxWidth: 620,
          }}>
            Let's{' '}
            <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>
              protect
            </span>{' '}
            what you share with me.
          </h1>
          <p style={{
            margin: '20px 0 0', fontSize: 17, color: ONB.inkSoft, lineHeight: 1.6, maxWidth: 520,
          }}>
            Pick how you'd like to confirm it's you. We'll ask once a month
            on this device — more often on new ones.
          </p>

          <div style={{ marginTop: 36, display: 'grid', gap: 14 }}>
            {options.map((opt, idx) => (
              <div key={opt.key} style={{
                position: 'relative',
                display: 'grid', gridTemplateColumns: '52px 1fr 24px', alignItems: 'center', gap: 20,
                padding: '22px 24px', borderRadius: 14,
                background: idx === 0 ? ONB.card : ONB.card,
                border: `1px solid ${idx === 0 ? ONB.ink : ONB.hairline}`,
                boxShadow: idx === 0 ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 28px rgba(19,19,26,0.06)' : 'none',
                cursor: 'pointer',
              }}>
                <span style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: idx === 0 ? ONB.indigoTint : 'rgba(19,19,26,0.04)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{opt.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: ONB.ink, letterSpacing: '-0.005em' }}>
                      {opt.title}
                    </p>
                    {opt.recommended ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: ONB.ink, color: '#FCFAF5',
                        fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                      }}>Recommended</span>
                    ) : null}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13.5, color: ONB.inkSoft, lineHeight: 1.5 }}>
                    {opt.desc}
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke={ONB.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>

          {/* If user picked SMS — inline confirm panel */}
          <div style={{
            marginTop: 18, padding: '20px 24px', borderRadius: 12,
            background: 'rgba(19,19,26,0.025)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', background: ONB.card,
                border: `1px solid ${ONB.hairline}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke={ONB.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{ fontSize: 13.5, color: ONB.ink }}>
                Phone verified · <span style={{ color: ONB.inkSoft }}>+1 (704) ••• 4127</span>
              </span>
            </div>
            <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: ONB.inkFaint }}>
              Change
            </span>
          </div>
        </div>
      </main>
      <OnbFooter/>
    </Frame>
  );
}

// ═════════════════════════════════════════════════════════════
// 05 · ABOUT YOU — seven-question form, two-column grid
// ═════════════════════════════════════════════════════════════
function ScreenAbout() {
  return (
    <Frame>
      <OnbPhaseHeader
        phase={2} phaseLabel="About you" step={1} stepCount={1} progress={0.42}
        rightSlot={<OnbStatusPill dot={ONB.gold}>Autosaved · 12s ago</OnbStatusPill>}
      />
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.95fr 1.6fr', overflow: 'hidden' }}>
        {/* Left rail — the editorial sidebar */}
        <aside style={{
          padding: '56px 48px 40px 96px', background: ONB.paper,
          borderRight: `1px solid ${ONB.hairlineSoft}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10.5, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
            }}>Phase 02 / 06</p>
            <h1 style={{
              margin: '14px 0 0', fontFamily: ONB.fontSans, fontWeight: 500,
              fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.025em', color: ONB.ink,
            }}>
              Let's{' '}
              <span style={{ fontFamily: ONB.fontSerif, fontStyle: 'italic', fontWeight: 400, color: ONB.indigo }}>
                start
              </span>{' '}
              with you.
            </h1>
            <p style={{ margin: '20px 0 0', fontSize: 15, color: ONB.inkSoft, lineHeight: 1.65, maxWidth: 320 }}>
              Seven questions — about ten minutes. Facts that anchor everything
              else we'll build together. Skip what you don't know; I'll come
              back to it later.
            </p>

            {/* Mini Q index */}
            <ul style={{ margin: '36px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 2, maxWidth: 280 }}>
              {[
                ['Legal name', true],
                ['Date of birth', true],
                ['State of residence', true],
                ['Marital status', true],
                ['Spouse or partner', false],
                ['Children & dependents', false],
                ['Household', false],
              ].map(([t, done], i) => (
                <li key={i} style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr 14px', alignItems: 'center', gap: 8,
                  padding: '7px 0', fontSize: 13.5, color: done ? ONB.ink : ONB.inkFaint,
                }}>
                  <span style={{
                    fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 14,
                    color: done ? ONB.indigo : ONB.inkFaint,
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{t}</span>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke={ONB.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : <span/>}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right — the form */}
        <section style={{
          padding: '56px 96px 40px 56px', overflowY: 'auto', background: ONB.paper,
        }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'grid', gap: 20 }}>
              <OnbInput label="Legal name (as on your ID)" value="Sydney Marie Reynolds" autosaved/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <OnbInput label="Date of birth" value="03 / 14 / 1989" autosaved/>
                <OnbSelect label="State of residence" value="North Carolina" autosaved/>
              </div>
              <OnbSelect label="Marital status" value="Married" autosaved/>

              {/* Spouse block */}
              <div style={{
                padding: 20, borderRadius: 12, background: ONB.card,
                border: `1px solid ${ONB.hairline}`,
              }}>
                <p style={{
                  margin: 0, fontSize: 11, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: ONB.ink, fontWeight: 600,
                }}>Spouse / partner</p>
                <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
                  <OnbInput placeholder="Full legal name"/>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <OnbInput placeholder="Date of birth"/>
                    <OnbSelect placeholder="State"/>
                  </div>
                </div>
              </div>

              {/* Children & dependents block */}
              <div style={{
                padding: 20, borderRadius: 12, background: ONB.card,
                border: `1px solid ${ONB.hairline}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{
                    margin: 0, fontSize: 11, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: ONB.ink, fontWeight: 600,
                  }}>Children & dependents</p>
                  <span style={{ fontSize: 11.5, color: ONB.inkFaint }}>0 added</span>
                </div>
                <button type="button" style={{
                  marginTop: 14, width: '100%', padding: '14px',
                  background: 'transparent', border: `1px dashed ${ONB.hairline}`,
                  borderRadius: 10, color: ONB.inkSoft, fontFamily: ONB.fontSans,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1, color: ONB.indigo }}>+</span>
                  Add a child or dependent
                </button>
              </div>

              {/* Household */}
              <OnbSelect label="Anyone else who depends on you?" placeholder="None — that's everyone"/>
            </div>

            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: ONB.inkFaint }}>4 of 7 complete</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <OnbButton variant="secondary" icon={false}>Back</OnbButton>
                <OnbButton size="lg">Save & continue</OnbButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Frame>
  );
}

// ═════════════════════════════════════════════════════════════
// 06 · YOUR LIFE — the split-pane: agent conversation + live profile
// ═════════════════════════════════════════════════════════════
function ScreenLife() {
  return (
    <div data-screen-label="06 Your life" style={{
      width: 1440, height: 900, background: ONB.paper,
      display: 'grid', gridTemplateColumns: '236px 1fr 460px',
      fontFamily: ONB.fontSans, color: ONB.ink, overflow: 'hidden',
    }}>
      {/* ─── App sidebar ─── */}
      <aside style={{
        background: ONB.paperDeep, borderRight: `1px solid ${ONB.hairlineSoft}`,
        padding: '22px 18px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '4px 8px 22px' }}>
          <OnbWordmark/>
        </div>

        {/* PHASE meter */}
        <div style={{
          padding: '14px 14px', borderRadius: 10, background: ONB.card,
          border: `1px solid ${ONB.hairline}`,
        }}>
          <p style={{
            margin: 0, fontSize: 9.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 600,
          }}>Phase 03 / 06</p>
          <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 500, color: ONB.ink }}>
            Your life
          </p>
          <div style={{ marginTop: 10, height: 3, borderRadius: 3, background: 'rgba(19,19,26,0.06)', overflow: 'hidden' }}>
            <div style={{ width: '38%', height: '100%', background: ONB.indigo }}/>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: ONB.inkFaint }}>
            12 of 31 prompts answered
          </p>
        </div>

        {/* Section nav */}
        <nav style={{ marginTop: 22, display: 'grid', gap: 2 }}>
          {[
            ['You',         'done'],
            ['Family',      'done'],
            ['Your life',   'active'],
            ['What you own','locked'],
            ['Who you protect','locked'],
            ['Your wishes', 'locked'],
          ].map(([label, state], i) => {
            const isActive = state === 'active';
            const isDone = state === 'done';
            return (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '24px 1fr 14px', alignItems: 'center', gap: 8,
                padding: '10px 10px', borderRadius: 8,
                background: isActive ? ONB.card : 'transparent',
                border: isActive ? `1px solid ${ONB.hairline}` : '1px solid transparent',
                cursor: 'pointer',
              }}>
                <span style={{
                  fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 14,
                  color: isActive ? ONB.indigo : (isDone ? ONB.gold : ONB.inkFaint),
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{
                  fontSize: 13.5, color: isActive ? ONB.ink : (isDone ? ONB.ink : ONB.inkFaint),
                  fontWeight: isActive ? 500 : 400,
                }}>{label}</span>
                {isDone ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke={ONB.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : state === 'locked' ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="11" width="12" height="8" rx="1.5" stroke={ONB.inkFaint} strokeWidth="1.5"/>
                    <path d="M9 11V8a3 3 0 0 1 6 0v3" stroke={ONB.inkFaint} strokeWidth="1.5"/>
                  </svg>
                ) : <span/>}
              </div>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: `1px solid ${ONB.hairlineSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 30, height: 30, borderRadius: '50%', background: ONB.indigo, color: '#FCFAF5',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600,
            }}>SR</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: ONB.ink }}>Sydney Reynolds</p>
              <p style={{ margin: 0, fontSize: 11, color: ONB.inkFaint }}>Charlotte, NC</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Conversation (middle pane) ─── */}
      <main style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Conversation header */}
        <div style={{
          padding: '20px 36px', borderBottom: `1px solid ${ONB.hairlineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `linear-gradient(135deg, ${ONB.indigo}, #5852F5)`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#FCFAF5', fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 18,
            }}>A</span>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: ONB.ink }}>Ava · your agent</p>
              <p style={{ margin: 0, fontSize: 12, color: ONB.inkFaint }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 6, background: '#10B981', marginRight: 6, verticalAlign: 'middle' }}/>
                Listening · remembers everything
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <OnbStatusPill dot={ONB.gold}>Autosaved</OnbStatusPill>
            <button style={{
              background: 'transparent', border: `1px solid ${ONB.hairline}`,
              padding: '7px 12px', borderRadius: 999, fontSize: 11.5,
              letterSpacing: '0.06em', color: ONB.inkSoft, cursor: 'pointer',
              fontFamily: ONB.fontSans,
            }}>Pause</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', display: 'grid', gap: 22 }}>
          {/* Date divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: ONB.inkFaint,
          }}>
            <span style={{ flex: 1, height: 1, background: ONB.hairlineSoft }}/>
            Today · 3:14 PM
            <span style={{ flex: 1, height: 1, background: ONB.hairlineSoft }}/>
          </div>

          {/* Agent msg 1 */}
          <AgentMsg>
            Beautiful, Sydney. We have you, Marcus, and the kids on the record.
            Let's talk about <em style={{ fontFamily: ONB.fontSerif, color: ONB.indigo, fontStyle: 'italic' }}>how you live</em> for a few minutes — work, the house, what a regular Tuesday looks like.
          </AgentMsg>

          <AgentMsg>
            Where do you spend most of your days? Take it broadly — career, neighborhood, a place you keep coming back to.
          </AgentMsg>

          {/* User msg */}
          <UserMsg>
            I run a small design studio out of NoDa. Three of us. The house in Plaza Midwood is home — we've been there eight years this fall.
          </UserMsg>

          {/* Agent extracted a fact */}
          <AgentMsg>
            <span style={{ display: 'block', marginBottom: 10 }}>Got it. I added a few things to your record on the right — tell me if I have any of it wrong.</span>
            <div style={{
              display: 'grid', gap: 8, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(59,53,195,0.05)', border: `1px solid ${ONB.indigoTint}`,
            }}>
              {[
                ['Occupation', 'Founder, Reynolds Studio'],
                ['Studio', 'NoDa · Charlotte, NC'],
                ['Residence', 'Plaza Midwood · 8 years'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: ONB.inkSoft, letterSpacing: '0.04em' }}>{k}</span>
                  <span style={{ color: ONB.ink, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </AgentMsg>

          <AgentMsg>
            Is the studio set up as an LLC, S-corp, or something else? No worries if you don't remember — we can find it later from the formation papers.
          </AgentMsg>

          {/* Composer */}
        </div>

        {/* Composer */}
        <div style={{ padding: '18px 36px 24px', borderTop: `1px solid ${ONB.hairlineSoft}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px 10px 18px', borderRadius: 16,
            background: ONB.card, border: `1px solid ${ONB.hairline}`,
          }}>
            <span style={{ fontSize: 14, color: ONB.inkFaint, flex: 1 }}>
              Type or hold <kbd style={{
                padding: '2px 6px', borderRadius: 4, background: 'rgba(19,19,26,0.05)',
                fontFamily: ONB.fontSans, fontSize: 11, color: ONB.inkSoft, border: `1px solid ${ONB.hairlineSoft}`,
              }}>space</kbd> to speak…
            </span>
            <button style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'transparent', border: `1px solid ${ONB.hairline}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="12" rx="3" stroke={ONB.ink} strokeWidth="1.6"/>
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={ONB.ink} strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: '50%',
              background: ONB.ink, border: `1px solid ${ONB.ink}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#FCFAF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={{ margin: '10px 4px 0', fontSize: 11, color: ONB.inkFaint }}>
            Press <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'rgba(19,19,26,0.05)', fontFamily: ONB.fontSans, fontSize: 10 }}>Esc</kbd> to skip a question. Ava remembers everything you say.
          </p>
        </div>
      </main>

      {/* ─── Right pane — the profile being built ─── */}
      <aside style={{
        background: ONB.card, borderLeft: `1px solid ${ONB.hairlineSoft}`,
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 28px', borderBottom: `1px solid ${ONB.hairlineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10.5, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
            }}>Your record</p>
            <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 500, color: ONB.ink }}>
              The Reynolds household
            </p>
          </div>
          <OnbStatusPill dot="#10B981">Live</OnbStatusPill>
        </div>

        <div style={{ padding: '24px 28px', display: 'grid', gap: 26 }}>
          <ProfileBlock title="You" items={[
            ['Legal name', 'Sydney Marie Reynolds'],
            ['Born', 'March 14, 1989'],
            ['State', 'North Carolina'],
            ['Status', 'Married'],
          ]}/>

          <ProfileBlock title="Family" items={[
            ['Spouse', 'Marcus Reynolds · 1986'],
            ['Children', 'Amari · 7    ·    Leila · 4'],
            ['Household', 'Just the four of us'],
          ]}/>

          <ProfileBlock title="Your life" highlight items={[
            ['Occupation', 'Founder · Reynolds Studio'],
            ['Studio', 'NoDa, Charlotte NC'],
            ['Residence', 'Plaza Midwood · 8 years'],
            ['Entity type', '— pending —'],
          ]}/>

          <div style={{
            padding: 14, borderRadius: 10, background: ONB.paperDeep,
            border: `1px dashed ${ONB.hairline}`,
          }}>
            <p style={{
              margin: 0, fontSize: 10.5, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: ONB.inkFaint, fontWeight: 500,
            }}>Coming up</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: ONB.inkSoft, lineHeight: 1.5 }}>
              What you own. We'll start with the home and the business, then
              follow the paper trail — no need to gather anything in advance.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Helpers for the conversation ───────────────────────────
function AgentMsg({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, maxWidth: 620 }}>
      <span style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `linear-gradient(135deg, ${ONB.indigo}, #5852F5)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#FCFAF5', fontFamily: ONB.fontSerif, fontStyle: 'italic', fontSize: 14,
      }}>A</span>
      <div style={{
        padding: '14px 18px', borderRadius: 14, borderTopLeftRadius: 4,
        background: ONB.card, border: `1px solid ${ONB.hairline}`,
        fontSize: 14.5, lineHeight: 1.6, color: ONB.ink,
      }}>{children}</div>
    </div>
  );
}

function UserMsg({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 480, padding: '12px 18px', borderRadius: 14, borderTopRightRadius: 4,
        background: ONB.ink, color: '#F4EFE6',
        fontSize: 14.5, lineHeight: 1.55,
      }}>{children}</div>
    </div>
  );
}

function ProfileBlock({ title, items, highlight }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        paddingBottom: 8, borderBottom: `1px solid ${ONB.hairline}`,
      }}>
        <h3 style={{ margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ONB.ink, fontWeight: 600 }}>
          {title}
        </h3>
        {highlight ? (
          <span style={{
            fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: ONB.indigo, fontWeight: 600,
          }}>Building…</span>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16" stroke={ONB.inkFaint} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <dl style={{ margin: '8px 0 0', display: 'grid', gap: 6 }}>
        {items.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <dt style={{ fontSize: 12.5, color: ONB.inkFaint, letterSpacing: '0.02em' }}>{k}</dt>
            <dd style={{ margin: 0, fontSize: 13, color: ONB.ink, fontWeight: 500, textAlign: 'right' }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

Object.assign(window, { ScreenProtect, ScreenAbout, ScreenLife });
