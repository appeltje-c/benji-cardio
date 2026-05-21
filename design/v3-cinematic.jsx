/* global React, Icon, hrZones, ZONE_RANGES, ZONE_COLOR, PROFILE, sampleTrainings, sampleDevices, fmtTime, fmtDur, fmtWeight, fmtHeight, useTweakCtx */

// ============================================================================
// V3 — "Cinematic / Race-clock"
// Pitch-black canvas, mono labels, oversized numerical typography. Editorial
// blocks, full-bleed gradients, geometric segment art. Surprising layouts —
// dashboards read like a race telemetry board, sessions like a film.
// Still uses Xingu tokens (indigo + orange) but pushed for dramatic contrast.
// ============================================================================

// ---------- ECG line waveform (sharper, glowing) ----------------------------
function V3ECG({ height = 44, color = "var(--xg-accent-400)", glow = true }) {
  return (
    <svg viewBox="0 0 320 44" preserveAspectRatio="none" width="100%" height={height} style={{ overflow: "visible" }}>
      <path
        d="M0 22 L40 22 L60 22 L72 12 L80 30 L88 4 L96 38 L104 22 L150 22 L180 22 L196 18 L202 28 L208 8 L216 36 L222 22 L260 22 L320 22"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
      />
    </svg>
  );
}

// ---------- "Telemetry row" — label + big mono value ------------------------
function V3Telem({ label, value, unit, color = "#fff", size = 32 }) {
  return (
    <div>
      <div className="v3-eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
        <span className="v3-num" style={{ fontSize: size, color }}>{value}</span>
        {unit && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--xg-font-mono)", fontWeight: 600, letterSpacing: 0.08 }}>{unit}</span>}
      </div>
    </div>
  );
}

function V3StatusBar({ title, back, action }) {
  return (
    <div style={{
      position: "absolute", top: 50, left: 0, right: 0, zIndex: 4,
      height: 52, padding: "0 16px",
      display: "flex", alignItems: "center", gap: 8,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {back && (
        <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon name="chevron-left" size={18} strokeWidth={2.4} />
        </button>
      )}
      <div className="v3-mono" style={{
        flex: 1, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
        textTransform: "uppercase", letterSpacing: "0.18em", paddingLeft: 4,
      }}>{title}</div>
      {action}
    </div>
  );
}

function V3TabBar({ active = "home" }) {
  const tabs = [
    { id: "home", label: "HOME" },
    { id: "lib",  label: "LIB"  },
    { id: "rec",  label: "REC"  },
    { id: "me",   label: "ME"   },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5,
      height: 78,
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      background: "#0A0B0F",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      paddingBottom: 18,
      fontFamily: "var(--xg-font-mono)",
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
          color: t.id === active ? "var(--xg-accent-400)" : "rgba(255,255,255,0.4)",
          position: "relative",
        }}>
          {t.label}
          {t.id === active && (
            <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 16, height: 2, background: "var(--xg-accent-400)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 01 — Onboarding
// ============================================================================
function V3Onboarding() {
  const { units } = useTweakCtx();
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 01 Onboarding">
      <div className="vt-page" style={{ paddingTop: 64, gap: 18 }}>
        <div className="v3-mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
          <span>VITAL / SETUP</span>
          <span>02 / 03</span>
        </div>
        <div>
          <div className="v3-eyebrow" style={{ color: "var(--xg-accent-400)" }}>Calibration</div>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95, margin: "8px 0 0", color: "#fff", textWrap: "balance" }}>
            Tell us<br/>about<br/><span style={{ color: "var(--xg-accent-400)" }}>your body.</span>
          </h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 14, lineHeight: 1.5 }}>
            We use age, weight & height to compute<br/>your heart-rate zones from <span style={{ fontFamily: "var(--xg-font-mono)", color: "rgba(255,255,255,0.85)" }}>HR<sub>max</sub> = 220 − age</span>.
          </div>
        </div>

        {/* Telemetry style inputs */}
        <div className="v3-card-strong" style={{ padding: 0, marginTop: 8 }}>
          {[
            { l: "AGE",       v: "34",  u: "YEARS"   },
            { l: "WEIGHT",    v: units === "imperial" ? "172" : "78",  u: units === "imperial" ? "LB" : "KG" },
            { l: "HEIGHT",    v: units === "imperial" ? "6'0\"" : "184", u: units === "imperial" ? "" : "CM" },
            { l: "RESTING HR", v: "56", u: "BPM" },
          ].map((f, i, arr) => (
            <div key={f.l} style={{
              display: "flex", alignItems: "center", padding: "16px 16px",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)", width: 90 }}>{f.l}</div>
              <span className="v3-num" style={{ fontSize: 28, color: "#fff" }}>{f.v}</span>
              {f.u && <span className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginLeft: 6, alignSelf: "flex-end", paddingBottom: 6 }}>{f.u}</span>}
              <Icon name="chevron-right" size={16} style={{ marginLeft: "auto", color: "rgba(255,255,255,0.3)" }} />
            </div>
          ))}
        </div>

        <button className="v3-btn v3-btn-primary" style={{ marginTop: "auto" }}>
          Generate zones →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 02 — Profile (zones as racing-grid blocks)
// ============================================================================
function V3Profile() {
  const { units } = useTweakCtx();
  const zones = hrZones(PROFILE.age);
  const max = 220 - PROFILE.age;
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 02 Profile">
      <V3StatusBar title="PROFILE / 01" />
      <div className="vt-page" style={{ paddingTop: 110, gap: 18 }}>
        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(135deg, var(--xg-brand-400), var(--xg-accent-400))", color: "#fff", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800 }}>D</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>DAAN</div>
            <div className="v3-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", marginTop: 2 }}>ATHLETE · ID 04812</div>
          </div>
        </div>

        {/* Big max HR display */}
        <div className="v3-card-strong" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
          <V3ECG height={44} color="var(--xg-accent-400)" />
          <div className="v3-eyebrow" style={{ marginTop: 8 }}>MAX HEART RATE</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: -4 }}>
            <span className="v3-num" style={{ fontSize: 96, color: "#fff", lineHeight: 1 }}>{max}</span>
            <span className="v3-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", paddingBottom: 14, letterSpacing: "0.16em" }}>BPM</span>
          </div>
          <div className="v3-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
            220 − {PROFILE.age}
          </div>
        </div>

        {/* Body metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ background: "#0A0B0F", padding: 14 }}>
            <V3Telem label="AGE" value={PROFILE.age} unit="YR" size={26} />
          </div>
          <div style={{ background: "#0A0B0F", padding: 14 }}>
            <V3Telem label="WEIGHT" value={units === "imperial" ? Math.round(PROFILE.weight * 2.20462) : PROFILE.weight} unit={units === "imperial" ? "LB" : "KG"} size={26} />
          </div>
          <div style={{ background: "#0A0B0F", padding: 14 }}>
            <V3Telem label="HEIGHT" value={units === "imperial" ? `6'0"` : PROFILE.height} unit={units === "imperial" ? "" : "CM"} size={26} />
          </div>
        </div>

        {/* Zones grid — 5 blocks, full bleed */}
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>HR ZONES · 5</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {zones.map((z) => (
              <div key={z.z} style={{
                background: "#0A0B0F",
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                borderLeft: `3px solid var(--hr-z${z.z}-solid)`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: `var(--hr-z${z.z}-solid)`, width: 28, letterSpacing: "-0.04em" }}>Z{z.z}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{z.name}</div>
                  <div className="v3-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", marginTop: 1 }}>{z.hint}</div>
                </div>
                <div className="v3-num" style={{ fontSize: 14, color: "#fff" }}>{z.bpmLo}–{z.bpmHi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <V3TabBar active="me" />
    </div>
  );
}

// ============================================================================
// 03 — Bluetooth pairing
// ============================================================================
function V3Pairing() {
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 03 Pairing">
      <V3StatusBar title="DEVICES / SCAN" back />
      <div className="vt-page" style={{ paddingTop: 110, gap: 16 }}>
        {/* Radar */}
        <div style={{ display: "grid", placeItems: "center", padding: "16px 0", position: "relative" }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            {/* Range rings */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                border: "1px dashed rgba(255,255,255,0.12)",
                transform: `scale(${i / 4})`,
              }} />
            ))}
            {/* Cross */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(255,255,255,0.08)" }} />
            {/* Sweep */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "conic-gradient(from 0deg, transparent 0deg, var(--xg-accent-400) 60deg, transparent 90deg)",
              opacity: 0.4,
            }} />
            {/* Center */}
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 36, height: 36, borderRadius: 18, background: "var(--xg-accent-400)", display: "grid", placeItems: "center", color: "#0A0B0F", boxShadow: "0 0 24px var(--xg-accent-400)" }}>
              <Icon name="radar" size={20} strokeWidth={2.4} />
            </div>
            {/* Device blips */}
            <div style={{ position: "absolute", left: "65%", top: "30%", width: 8, height: 8, borderRadius: 4, background: "var(--xg-success-300)", boxShadow: "0 0 12px var(--xg-success-300)" }} />
            <div style={{ position: "absolute", left: "32%", top: "55%", width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.6)" }} />
            <div style={{ position: "absolute", left: "70%", top: "68%", width: 5, height: 5, borderRadius: 2.5, background: "rgba(255,255,255,0.5)" }} />
            <div style={{ position: "absolute", left: "20%", top: "25%", width: 5, height: 5, borderRadius: 2.5, background: "rgba(255,255,255,0.4)" }} />
          </div>
        </div>
        <div className="v3-mono" style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
          SCANNING · 4 DEVICES NEARBY
        </div>

        {/* Devices list */}
        <div className="v3-card-strong" style={{ padding: 0, marginTop: 4 }}>
          {/* Connected row */}
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid var(--xg-success-400)" }}>
            <Icon name="heart-pulse" size={22} color="var(--xg-accent-400)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Polar H10</div>
              <div className="v3-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", marginTop: 2 }}>A4:C1:38:7F:91:E2 · 84%</div>
            </div>
            <div className="v3-mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--xg-success-300)", letterSpacing: "0.14em" }}>● LINKED</div>
          </div>
          {sampleDevices.slice(1, 4).map((d, i, arr) => (
            <div key={d.id} style={{
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <Icon name="heart-pulse" size={22} color="rgba(255,255,255,0.4)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{d.name}</div>
                <div className="v3-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", marginTop: 2 }}>{d.mac} · {d.rssi}dBm</div>
              </div>
              {/* Signal bars */}
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                {[6, 8, 10, 12].map((h, j) => {
                  const strength = Math.max(0, 4 + Math.round((d.rssi + 50) / 8)); // crude
                  return <div key={j} style={{ width: 3, height: h, background: j < strength ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)" }} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 04 — Library
// ============================================================================
function V3Library() {
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 04 Library">
      <V3StatusBar title="TRAININGS · 04" action={
        <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--xg-accent-400)", background: "rgba(255,85,31,0.12)", color: "var(--xg-accent-400)", display: "grid", placeItems: "center" }}>
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </button>
      } />
      <div className="vt-page" style={{ paddingTop: 110, gap: 14 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95, color: "#fff", textWrap: "balance" }}>
          Pick your<br/><span style={{ color: "var(--xg-accent-400)" }}>weapon.</span>
        </h1>

        {/* Tab strip */}
        <div className="v3-mono" style={{ display: "flex", gap: 14, fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ color: "var(--xg-accent-400)", borderBottom: "2px solid var(--xg-accent-400)", paddingBottom: 8, marginBottom: -5 }}>ALL · 4</span>
          <span>FAVORITES</span>
          <span>RECENT</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sampleTrainings.map((t, idx) => {
            const peak = Math.max(...t.segments.map(s => s.z));
            return (
              <div key={t.id} className="v3-card-strong" style={{ padding: 0, overflow: "hidden" }}>
                {/* Block 1: ID + Title */}
                <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>{String(idx + 1).padStart(2, "0")}</span>
                  <span className={`v3-zone-tag zone-${peak}`}>PEAK Z{peak}</span>
                  <span className="v3-mono" style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)" }}>{fmtDur(t.duration).toUpperCase()}</span>
                </div>
                <div style={{ padding: "6px 14px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", flex: 1 }}>{t.name}</div>
                  <Icon name="play" size={20} color="var(--xg-accent-400)" strokeWidth={2.4} />
                </div>
                {/* Block 2: segment chart strip */}
                <div style={{ display: "flex", gap: 0, height: 36, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {t.segments.map((s, i) => (
                    <div key={i} style={{
                      flex: s.d,
                      background: `var(--hr-z${s.z}-solid)`,
                      opacity: 0.85,
                      borderRight: i < t.segments.length - 1 ? "1px solid #0A0B0F" : "none",
                    }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <V3TabBar active="lib" />
    </div>
  );
}

// ============================================================================
// 05 — Builder (rail timeline)
// ============================================================================
function V3Builder() {
  const t = sampleTrainings[0];
  const total = t.segments.reduce((a, s) => a + s.d, 0);
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 05 Builder">
      <V3StatusBar title="BUILDER" back action={
        <button className="v3-mono" style={{ height: 32, padding: "0 14px", borderRadius: 6, border: 0, background: "var(--xg-accent-400)", color: "#0A0B0F", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>SAVE</button>
      } />
      <div className="vt-page" style={{ paddingTop: 100, gap: 16 }}>
        {/* Title */}
        <div>
          <div className="v3-eyebrow" style={{ color: "var(--xg-accent-400)" }}>WORKOUT 01 · INTERVAL</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "#fff", marginTop: 6 }}>{t.name}</h1>
        </div>

        {/* Summary stat ribbon */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ background: "#0A0B0F", padding: "12px 14px" }}>
            <V3Telem label="TOTAL" value={fmtDur(total)} size={20} />
          </div>
          <div style={{ background: "#0A0B0F", padding: "12px 14px" }}>
            <V3Telem label="SEGMENTS" value={t.segments.length} size={20} />
          </div>
          <div style={{ background: "#0A0B0F", padding: "12px 14px" }}>
            <V3Telem label="AVG ZONE" value="Z3" size={20} color="var(--hr-z3-solid)" />
          </div>
        </div>

        {/* Vertical timeline with rail */}
        <div className="v3-eyebrow">SEGMENTS</div>
        <div style={{ position: "relative", paddingLeft: 24 }}>
          {/* Rail */}
          <div style={{ position: "absolute", left: 11, top: 6, bottom: 6, width: 1, background: "rgba(255,255,255,0.12)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.segments.slice(0, 6).map((s, i) => (
              <div key={i} style={{ position: "relative", display: "flex", alignItems: "stretch", gap: 12 }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: -19, top: 18,
                  width: 14, height: 14, borderRadius: 7,
                  background: "#0A0B0F", border: `2px solid var(--hr-z${s.z}-solid)`,
                }} />
                {/* Card */}
                <div className="v3-card" style={{ flex: 1, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 4, alignSelf: "stretch", borderRadius: 2,
                    background: `var(--hr-z${s.z}-solid)`,
                  }} />
                  <span className={`v3-zone-tag zone-${s.z}`}>Z{s.z}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.l}</div>
                    <div className="v3-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginTop: 1 }}>{ZONE_RANGES[s.z-1].name.toUpperCase()}</div>
                  </div>
                  <div className="v3-num" style={{ fontSize: 18, color: "#fff" }}>{fmtTime(s.d)}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Add button */}
          <div style={{ marginTop: 8 }}>
            <button className="v3-btn v3-btn-ghost" style={{ height: 40, fontSize: 11 }}>
              <Icon name="plus" size={14} strokeWidth={2.4} /> ADD SEGMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 06 — Active session (the showpiece)
// ============================================================================
function V3Session() {
  const t = sampleTrainings[0];
  const currentSegIdx = 1;          // "Hard 1" · Z4 — matches default bpm 164 and Quick-state values
  const seg = t.segments[currentSegIdx];
  const elapsedSeg = 142;
  const zone = seg.z;
  const next = t.segments[currentSegIdx + 1];

  // Target range for this segment, computed from profile.
  const zones = hrZones(PROFILE.age);
  const target = zones[zone - 1];   // e.g. Z4 → 149–168
  const targetMid = Math.round((target.bpmLo + target.bpmHi) / 2);

  // Live HR from Tweaks panel (so user can flip between states).
  const { liveHr } = useTweakCtx();
  const bpm = typeof liveHr === "number" ? liveHr : 164;

  // Coaching status — three states with intent, delta, color & icon.
  let status;
  if (bpm < target.bpmLo) {
    const delta = target.bpmLo - bpm;
    status = {
      key: "push", label: "PUSH HARDER",
      hint: `+${delta} BPM TO REACH ZONE`,
      icon: "arrow-up", color: "var(--xg-accent-400)",
      bg: "rgba(255,85,31,0.14)", border: "rgba(255,85,31,0.45)",
    };
  } else if (bpm > target.bpmHi) {
    const delta = bpm - target.bpmHi;
    status = {
      key: "ease", label: "EASE OFF",
      hint: `\u2212${delta} BPM TO STAY IN ZONE`,
      icon: "arrow-down", color: "#FF6F6F",
      bg: "rgba(216,32,32,0.18)", border: "rgba(216,32,32,0.45)",
    };
  } else {
    status = {
      key: "ok", label: "ON RANGE",
      hint: `HOLD STEADY \u00b7 \u00b1${Math.max(bpm - targetMid, targetMid - bpm)} FROM MID`,
      icon: "check", color: "#5BD25B",
      bg: "rgba(57,194,57,0.14)", border: "rgba(57,194,57,0.45)",
    };
  }

  return (
    <div className="vt-screen v3-shell" data-screen-label="V3 · 06 Session" style={{
      background: `radial-gradient(800px 600px at 50% 0%, var(--hr-z${zone}-solid) -20%, transparent 60%), #0A0B0F`,
    }}>
      {/* Top status */}
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, zIndex: 4, padding: "14px 16px", display: "flex", alignItems: "center" }}>
        <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon name="chevron-down" size={18} strokeWidth={2.4} />
        </button>
        <div className="v3-mono" style={{ marginLeft: 12, fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)" }}>
          THRESHOLD 4×4 · LIVE
        </div>
        <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: 4, background: "var(--xg-accent-400)", boxShadow: "0 0 8px var(--xg-accent-400)" }} />
      </div>

      <div style={{ flex: 1, padding: "110px 20px 110px", display: "flex", flexDirection: "column", color: "#fff" }}>
        {/* Segment label */}
        <div className="v3-mono" style={{ fontSize: 11, letterSpacing: "0.24em", color: `var(--hr-z${zone}-solid)`, marginBottom: 4 }}>
          ZONE {zone} · {ZONE_RANGES[zone-1].name.toUpperCase()}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1 }}>{seg.l}</div>

        {/* Giant BPM */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", margin: "10px 0" }}>
          <V3ECG height={56} color={status.color} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div className="v3-num" style={{ fontSize: 160, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{bpm}</div>
            <div className="v3-mono" style={{ fontSize: 11, letterSpacing: "0.24em", color: "rgba(255,255,255,0.5)", marginTop: -8 }}>BPM</div>
          </div>

          {/* Coaching status — PUSH / ON RANGE / EASE */}
          <div style={{
            marginTop: 14,
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "10px 16px",
            background: status.bg,
            border: `1px solid ${status.border}`,
            borderRadius: 999,
          }}>
            <Icon name={status.icon} size={16} strokeWidth={2.6} color={status.color} />
            <span className="v3-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: status.color }}>
              {status.label}
            </span>
          </div>
          <div className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            {status.hint}
          </div>

          {/* Target range bar — shows where current BPM sits in the band */}
          <div style={{ width: "100%", marginTop: 14 }}>
            {(() => {
              const bandLo = Math.min(target.bpmLo - 12, bpm - 8);
              const bandHi = Math.max(target.bpmHi + 12, bpm + 8);
              const span   = bandHi - bandLo;
              const pctLo  = ((target.bpmLo - bandLo) / span) * 100;
              const pctHi  = ((target.bpmHi - bandLo) / span) * 100;
              const pctBpm = ((bpm - bandLo) / span) * 100;
              return (
                <>
                  <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                    {/* target zone */}
                    <div style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: `${pctLo}%`, width: `${pctHi - pctLo}%`,
                      background: `var(--hr-z${zone}-solid)`, opacity: 0.5,
                      borderRadius: 4,
                    }} />
                    {/* current bpm marker */}
                    <div style={{
                      position: "absolute", top: -4, bottom: -4,
                      left: `calc(${pctBpm}% - 2px)`, width: 4,
                      background: status.color, borderRadius: 2,
                      boxShadow: `0 0 8px ${status.color}`,
                    }} />
                  </div>
                  <div className="v3-mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)" }}>
                    <span>TARGET</span>
                    <span style={{ color: "rgba(255,255,255,0.75)" }}>{target.bpmLo} — {target.bpmHi} BPM</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Segment progress dots */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {t.segments.map((s, i) => (
            <div key={i} style={{
              flex: s.d, height: 6, borderRadius: 1,
              background: i < currentSegIdx ? `var(--hr-z${s.z}-solid)`
                          : i === currentSegIdx ? "rgba(255,255,255,0.35)"
                          : "rgba(255,255,255,0.08)",
              position: "relative",
              overflow: "hidden",
            }}>
              {i === currentSegIdx && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(elapsedSeg / seg.d) * 100}%`, background: `var(--hr-z${zone}-solid)` }} />
              )}
            </div>
          ))}
        </div>

        {/* Telemetry strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ background: "#0A0B0F", padding: "10px 12px" }}>
            <V3Telem label="REMAINING" value={fmtTime(seg.d - elapsedSeg)} size={22} color={`var(--hr-z${zone}-solid)`} />
          </div>
          <div style={{ background: "#0A0B0F", padding: "10px 12px" }}>
            <V3Telem label="ELAPSED" value="08:42" size={22} />
          </div>
          <div style={{ background: "#0A0B0F", padding: "10px 12px" }}>
            <V3Telem label="UP NEXT" value={`Z${next.z}`} size={22} color={`var(--hr-z${next.z}-solid)`} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 20px 32px", display: "flex", gap: 10, zIndex: 4 }}>
        <button style={{ width: 56, height: 56, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", color: "#fff", display: "grid", placeItems: "center" }}>
          <Icon name="skip-back" size={20} strokeWidth={2.4} />
        </button>
        <button className="v3-btn v3-btn-light" style={{ flex: 1 }}>
          <Icon name="pause" size={18} strokeWidth={2.5} /> PAUSE
        </button>
        <button style={{ width: 56, height: 56, borderRadius: 8, border: 0, background: "var(--xg-error-500)", color: "#fff", display: "grid", placeItems: "center" }}>
          <Icon name="square" size={18} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 07 — Summary
// ============================================================================
function V3Summary() {
  const dist = [
    { z: 1, sec: 14 * 60 },
    { z: 2, sec: 6 * 60 },
    { z: 3, sec: 4 * 60 },
    { z: 4, sec: 11 * 60 },
    { z: 5, sec: 1 * 60 },
  ];
  const total = dist.reduce((a, d) => a + d.sec, 0);
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 07 Summary">
      <V3StatusBar title="SESSION · COMPLETE" back />
      <div className="vt-page" style={{ paddingTop: 100, gap: 16 }}>
        <div>
          <div className="v3-eyebrow" style={{ color: "var(--xg-accent-400)" }}>MAY 20 · 07:42 — 08:18</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95, color: "#fff", marginTop: 6, textWrap: "balance" }}>
            Threshold<br/>4×4 · <span style={{ color: "var(--hr-z4-solid)" }}>done.</span>
          </h1>
        </div>

        {/* Big duration */}
        <div className="v3-card-strong">
          <div className="v3-eyebrow">DURATION</div>
          <div className="v3-num" style={{ fontSize: 72, color: "#fff", lineHeight: 1, marginTop: 4 }}>36:18</div>
          <V3ECG height={28} color="rgba(255,255,255,0.3)" glow={false} />
        </div>

        {/* Telemetry */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          {[
            { l: "AVG HR",   v: "148", u: "BPM",  color: "var(--hr-z3-solid)" },
            { l: "MAX HR",   v: "178", u: "BPM",  color: "var(--hr-z4-solid)" },
            { l: "CALORIES", v: "412", u: "KCAL" },
            { l: "LOAD",     v: "84",  u: "TSS",  color: "var(--xg-accent-400)" },
          ].map(s => (
            <div key={s.l} style={{ background: "#0A0B0F", padding: "14px 16px" }}>
              <V3Telem label={s.l} value={s.v} unit={s.u} color={s.color || "#fff"} size={32} />
            </div>
          ))}
        </div>

        {/* Zone bars vertical */}
        <div className="v3-card-strong" style={{ padding: 16 }}>
          <div className="v3-eyebrow" style={{ marginBottom: 10 }}>TIME IN ZONES</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {dist.map(d => {
              const h = (d.sec / Math.max(...dist.map(x => x.sec))) * 100;
              return (
                <div key={d.z} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div className="v3-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{Math.floor(d.sec/60)}m</div>
                  <div style={{ width: "100%", height: `${h}%`, background: `var(--hr-z${d.z}-solid)`, borderRadius: 2, minHeight: 4 }} />
                  <div className="v3-mono" style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 0.08 }}>Z{d.z}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 20px 32px", display: "flex", gap: 10, zIndex: 4 }}>
        <button className="v3-btn v3-btn-ghost" style={{ width: 56, flex: "none", padding: 0 }}>
          <Icon name="share-2" size={18} strokeWidth={2.2} />
        </button>
        <button className="v3-btn v3-btn-primary">SAVE & CLOSE</button>
      </div>
    </div>
  );
}

// ============================================================================
// 08 — Home (dashboard / "command bridge")
// ============================================================================
function V3Home() {
  const next = sampleTrainings[2];
  return (
    <div className="vt-screen v3-shell v3-bg" data-screen-label="V3 · 08 Home">
      <div className="vt-page" style={{ paddingTop: 64, gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>20.05.2026 / TUE</div>
          <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--xg-success-300)" }} />
            <span className="v3-mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}>H10 · 84%</span>
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95, color: "#fff", textWrap: "balance" }}>
          Good morning,<br/><span style={{ color: "var(--xg-accent-400)" }}>Daan.</span>
        </h1>

        {/* Today's training — full bleed */}
        <div style={{
          borderRadius: 14, overflow: "hidden",
          background: "linear-gradient(135deg, rgba(255,85,31,0.18), rgba(6,51,249,0.18))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ padding: "16px 16px 12px" }}>
            <div className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--xg-accent-300)" }}>TODAY · PLANNED</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", marginTop: 4 }}>{next.name}</div>
            <div className="v3-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {fmtDur(next.duration).toUpperCase()} · {next.segments.length} SEGMENTS
            </div>
          </div>
          {/* Segment strip */}
          <div style={{ display: "flex", height: 28 }}>
            {next.segments.map((s, i) => (
              <div key={i} style={{ flex: s.d, background: `var(--hr-z${s.z}-solid)` }} />
            ))}
          </div>
          <div style={{ padding: 14 }}>
            <button className="v3-btn v3-btn-primary">
              <Icon name="play" size={16} strokeWidth={2.5} /> START
            </button>
          </div>
        </div>

        {/* Telemetry grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ background: "#0A0B0F", padding: "14px 16px" }}>
            <V3Telem label="THIS WEEK" value="3:42" unit="HRS" size={26} />
          </div>
          <div style={{ background: "#0A0B0F", padding: "14px 16px" }}>
            <V3Telem label="SESSIONS" value="4" unit="OF 5" size={26} color="var(--xg-accent-400)" />
          </div>
          <div style={{ background: "#0A0B0F", padding: "14px 16px" }}>
            <V3Telem label="RESTING HR" value="54" unit="BPM ↓2" size={26} color="var(--xg-success-300)" />
          </div>
          <div style={{ background: "#0A0B0F", padding: "14px 16px" }}>
            <V3Telem label="LOAD" value="218" unit="TSS WK" size={26} />
          </div>
        </div>

        {/* Last session quick row */}
        <div className="v3-eyebrow">LAST · YESTERDAY</div>
        <div className="v3-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="v3-zone-tag zone-2">Z2</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Z2 Base Build</div>
            <div className="v3-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginTop: 2 }}>60M · AVG 138 BPM</div>
          </div>
          <Icon name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />
        </div>
      </div>
      <V3TabBar active="home" />
    </div>
  );
}

window.V3Onboarding = V3Onboarding;
window.V3Profile    = V3Profile;
window.V3Pairing    = V3Pairing;
window.V3Library    = V3Library;
window.V3Builder    = V3Builder;
window.V3Session    = V3Session;
window.V3Summary    = V3Summary;
window.V3Home       = V3Home;
