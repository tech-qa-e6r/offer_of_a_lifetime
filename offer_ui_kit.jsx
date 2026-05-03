import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  bg: "#0a0e17",
  bgCard: "#12182a",
  bgPanel: "rgba(15,22,42,0.92)",
  bgOverlay: "rgba(0,0,0,0.72)",
  surface: "#1a2240",
  surfaceHover: "#1f2b52",
  border: "rgba(99,140,255,0.15)",
  borderActive: "rgba(99,140,255,0.5)",
  accent: "#638cff",
  accentGlow: "rgba(99,140,255,0.35)",
  gold: "#ffd66b",
  goldGlow: "rgba(255,214,107,0.3)",
  green: "#4ade80",
  greenGlow: "rgba(74,222,128,0.25)",
  red: "#f87171",
  redGlow: "rgba(248,113,113,0.25)",
  text: "#e2e8f0",
  textMuted: "#7a8baa",
  textDim: "#4a5568",
  fontDisplay: "'Unbounded', sans-serif",
  fontBody: "'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
  shadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(99,140,255,0.08)",
  shadowGlow: "0 0 24px rgba(99,140,255,0.2), 0 0 48px rgba(99,140,255,0.08)",
};

// ─── CARD DATA (matches ScriptableObjects from CLAUDE.md) ────
const SETUP_CARDS = [
  { category: "AgeAndBackground", cardName: "Возраст: 27", backgroundStory: "Выпускник технического вуза, 3 года фриланса. Мечтает о стабильной работе в IT.", startingMoney: 0, startingDays: 0, skillName: "" },
  { category: "BasicSkill", cardName: "C# Developer", backgroundStory: "Уверенно пишет на C#, знает Unity и .NET. Готов к техническим собеседованиям.", startingMoney: 0, startingDays: 0, skillName: "C#" },
  { category: "StartingResources", cardName: "Скромные сбережения", backgroundStory: "Отложил немного денег и взял отпуск. Время ограничено.", startingMoney: 500, startingDays: 14, skillName: "" },
  { category: "EmploymentStatus", cardName: "Безработный", backgroundStory: "Сейчас без работы — можно полностью сфокусироваться на поиске оффера.", startingMoney: 0, startingDays: 0, skillName: "" },
];

const ACTION_CARDS = [
  { cardName: "Сходить в коворкинг", description: "Поработать над pet-проектом в модном коворкинге. Шанс встретить нужных людей.", moneyCost: 200, timeCostDays: 1, targetRoll: 10, rewardMoney: 100 },
  { cardName: "Пройти курс", description: "Онлайн-курс по новой технологии. Инвестиция в навыки.", moneyCost: 150, timeCostDays: 3, targetRoll: 8, rewardMoney: 300 },
  { cardName: "Митап разработчиков", description: "Нетворкинг на местном митапе. Можно получить реферал.", moneyCost: 50, timeCostDays: 1, targetRoll: 12, rewardMoney: 250 },
  { cardName: "Фриланс-заказ", description: "Быстрый заказ на фрилансе. Гарантированные деньги при успехе.", moneyCost: 0, timeCostDays: 2, targetRoll: 6, rewardMoney: 200 },
];

const CATEGORY_LABELS = {
  AgeAndBackground: "Возраст",
  BasicSkill: "Навык",
  StartingResources: "Ресурсы",
  EmploymentStatus: "Статус",
};

const CATEGORY_ICONS = {
  AgeAndBackground: "👤",
  BasicSkill: "⚡",
  StartingResources: "💰",
  EmploymentStatus: "📋",
};

// ─── STYLES ──────────────────────────────────────────────────
const styles = {
  app: {
    fontFamily: T.fontBody,
    background: T.bg,
    color: T.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  bgGrid: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: `
      linear-gradient(rgba(99,140,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,140,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
  },
  header: {
    padding: "20px 28px 12px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderBottom: `1px solid ${T.border}`, zIndex: 2, position: "relative",
  },
  title: {
    fontFamily: T.fontDisplay, fontSize: "18px", fontWeight: 700,
    background: `linear-gradient(135deg, ${T.accent}, ${T.gold})`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  statsBar: {
    display: "flex", gap: "20px", alignItems: "center",
  },
  statItem: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "14px", fontWeight: 600,
  },
  statIcon: { fontSize: "16px" },
  phaseLabel: {
    fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px",
    color: T.accent, fontWeight: 700,
    padding: "4px 12px", borderRadius: "20px",
    background: "rgba(99,140,255,0.1)", border: `1px solid ${T.border}`,
  },
  main: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px", gap: "24px", zIndex: 1, position: "relative",
  },
  sectionTitle: {
    fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: 600,
    color: T.textMuted, textTransform: "uppercase", letterSpacing: "3px",
    marginBottom: "4px",
  },
  // ── SETUP CARDS ──
  setupGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px", maxWidth: "720px", width: "100%",
  },
  setupCard: (revealed) => ({
    width: "100%", aspectRatio: "3/4",
    borderRadius: T.radius,
    border: `1.5px solid ${revealed ? T.borderActive : T.border}`,
    background: revealed
      ? `linear-gradient(145deg, ${T.bgCard}, ${T.surface})`
      : `linear-gradient(145deg, ${T.surface}, #0d1228)`,
    cursor: revealed ? "default" : "pointer",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "16px", textAlign: "center",
    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
    boxShadow: revealed ? T.shadowGlow : T.shadow,
    position: "relative", overflow: "hidden",
  }),
  setupCardHover: {
    transform: "translateY(-4px) scale(1.02)",
    borderColor: T.accent,
    boxShadow: `${T.shadowGlow}, 0 12px 40px rgba(0,0,0,0.4)`,
  },
  cardBack: {
    fontSize: "32px", marginBottom: "8px", opacity: 0.6,
    filter: "grayscale(0.3)",
  },
  cardBackLabel: {
    fontSize: "11px", color: T.textMuted,
    textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600,
  },
  cardCategory: {
    fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px",
    color: T.accent, fontWeight: 700, marginBottom: "6px",
  },
  cardTitle: {
    fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: 700,
    color: T.text, marginBottom: "6px", lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: "10px", color: T.textMuted, lineHeight: 1.5,
  },
  cardBonus: {
    marginTop: "auto", paddingTop: "8px",
    fontSize: "11px", fontWeight: 700, color: T.gold,
  },
  // ── ACTION CARDS ──
  actionGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px", maxWidth: "800px", width: "100%",
  },
  actionCard: {
    borderRadius: T.radius,
    border: `1.5px solid ${T.border}`,
    background: `linear-gradient(165deg, ${T.bgCard}, ${T.surface})`,
    padding: "20px 16px", cursor: "pointer",
    display: "flex", flexDirection: "column", gap: "8px",
    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
    boxShadow: T.shadow, position: "relative", overflow: "hidden",
  },
  actionCardHover: {
    transform: "translateY(-6px)",
    borderColor: T.accent,
    boxShadow: `${T.shadowGlow}, 0 16px 48px rgba(0,0,0,0.35)`,
  },
  actionName: {
    fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: 700,
    color: T.text, lineHeight: 1.3,
  },
  actionDesc: {
    fontSize: "11px", color: T.textMuted, lineHeight: 1.5, flex: 1,
  },
  actionStats: {
    display: "flex", justifyContent: "space-between", flexWrap: "wrap",
    gap: "4px", paddingTop: "8px",
    borderTop: `1px solid ${T.border}`,
  },
  actionStat: (color) => ({
    fontSize: "10px", fontWeight: 700, color,
    display: "flex", alignItems: "center", gap: "3px",
  }),
  // ── PLAYER BAR (bottom, shows revealed setup cards) ──
  playerBar: {
    background: T.bgPanel,
    borderTop: `1px solid ${T.border}`,
    padding: "12px 24px",
    display: "flex", gap: "12px", alignItems: "center",
    justifyContent: "center", zIndex: 2, position: "relative",
    backdropFilter: "blur(12px)",
  },
  miniCard: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusSm,
    padding: "8px 14px",
    fontSize: "11px", fontWeight: 600,
    display: "flex", alignItems: "center", gap: "6px",
    color: T.text,
  },
  // ── EVENT LOG ──
  eventLog: {
    position: "absolute", right: "20px", top: "80px",
    width: "260px", maxHeight: "calc(100vh - 240px)",
    background: T.bgPanel, borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    padding: "16px", overflowY: "auto",
    backdropFilter: "blur(12px)", zIndex: 3,
  },
  logTitle: {
    fontFamily: T.fontDisplay, fontSize: "11px", fontWeight: 700,
    color: T.accent, textTransform: "uppercase", letterSpacing: "2px",
    marginBottom: "12px",
  },
  logEntry: (success) => ({
    fontSize: "11px", color: success ? T.green : T.red,
    padding: "6px 0",
    borderBottom: `1px solid ${T.border}`,
    lineHeight: 1.4,
  }),
  // ── POPUP (ResultPopup) ──
  overlay: {
    position: "fixed", inset: 0,
    background: T.bgOverlay,
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, backdropFilter: "blur(6px)",
  },
  popup: {
    background: `linear-gradient(160deg, #151d38, ${T.bgCard})`,
    border: `1.5px solid ${T.borderActive}`,
    borderRadius: "18px",
    padding: "36px 32px 28px",
    maxWidth: "420px", width: "90%",
    boxShadow: `0 24px 80px rgba(0,0,0,0.6), ${T.shadowGlow}`,
    textAlign: "center",
  },
  popupTitle: {
    fontFamily: T.fontDisplay, fontSize: "20px", fontWeight: 800,
    marginBottom: "12px", lineHeight: 1.3,
  },
  popupBody: {
    fontSize: "13px", color: T.textMuted, lineHeight: 1.7,
    marginBottom: "24px",
  },
  popupDice: {
    fontFamily: T.fontDisplay, fontSize: "48px", fontWeight: 900,
    margin: "16px 0",
  },
  btn: (variant = "accent") => ({
    fontFamily: T.fontBody, fontSize: "13px", fontWeight: 700,
    padding: "12px 32px", borderRadius: "10px",
    border: "none", cursor: "pointer",
    textTransform: "uppercase", letterSpacing: "1.5px",
    transition: "all 0.2s ease",
    background: variant === "accent"
      ? `linear-gradient(135deg, ${T.accent}, #4a6ee0)`
      : variant === "green"
        ? `linear-gradient(135deg, ${T.green}, #22c55e)`
        : `linear-gradient(135deg, ${T.red}, #dc2626)`,
    color: "#fff",
    boxShadow: variant === "accent"
      ? `0 4px 16px ${T.accentGlow}`
      : variant === "green"
        ? `0 4px 16px ${T.greenGlow}`
        : `0 4px 16px ${T.redGlow}`,
  }),
  // ── GAME OVER ──
  gameOverTitle: (won) => ({
    fontFamily: T.fontDisplay, fontSize: "28px", fontWeight: 900,
    color: won ? T.gold : T.red,
    textShadow: won
      ? `0 0 32px ${T.goldGlow}`
      : `0 0 32px ${T.redGlow}`,
    marginBottom: "8px",
  }),
  gameOverStats: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "12px", margin: "20px 0",
  },
  gameOverStat: {
    background: T.surface, borderRadius: T.radiusSm,
    padding: "14px", textAlign: "center",
    border: `1px solid ${T.border}`,
  },
  gameOverStatValue: {
    fontFamily: T.fontDisplay, fontSize: "22px", fontWeight: 800,
    color: T.text,
  },
  gameOverStatLabel: {
    fontSize: "10px", color: T.textMuted, textTransform: "uppercase",
    letterSpacing: "1.5px", marginTop: "4px",
  },
  // ── NAV (phase switcher for demo) ──
  demoNav: {
    display: "flex", gap: "8px", padding: "16px 24px",
    justifyContent: "center", zIndex: 10, position: "relative",
  },
  demoBtn: (active) => ({
    fontFamily: T.fontBody, fontSize: "11px", fontWeight: 600,
    padding: "8px 16px", borderRadius: "8px",
    border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? "rgba(99,140,255,0.15)" : "transparent",
    color: active ? T.accent : T.textMuted,
    cursor: "pointer", transition: "all 0.2s ease",
    textTransform: "uppercase", letterSpacing: "1px",
  }),
};

// ─── FONTS LOADER ────────────────────────────────────────────
function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes popIn {
        0% { transform: scale(0.85); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes diceRoll {
        0% { transform: rotateZ(0deg) scale(0.5); opacity: 0; }
        50% { transform: rotateZ(180deg) scale(1.3); }
        100% { transform: rotateZ(360deg) scale(1); opacity: 1; }
      }
    `}</style>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────

function SetupCardSlot({ card, index, revealed, onReveal }) {
  const [hover, setHover] = useState(false);
  const cat = card.category;
  return (
    <div
      style={{
        ...styles.setupCard(revealed),
        ...(hover && !revealed ? styles.setupCardHover : {}),
        animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !revealed && onReveal(index)}
    >
      {!revealed ? (
        <>
          <div style={styles.cardBack}>{CATEGORY_ICONS[cat]}</div>
          <div style={styles.cardBackLabel}>{CATEGORY_LABELS[cat]}</div>
          <div style={{
            position: "absolute", inset: 0, borderRadius: T.radius,
            background: hover
              ? "linear-gradient(135deg, rgba(99,140,255,0.08), transparent)"
              : "none",
            transition: "background 0.3s ease",
          }} />
        </>
      ) : (
        <>
          <div style={styles.cardCategory}>{CATEGORY_LABELS[cat]}</div>
          <div style={styles.cardTitle}>{card.cardName}</div>
          <div style={styles.cardDesc}>{card.backgroundStory}</div>
          {(card.startingMoney > 0 || card.startingDays > 0) && (
            <div style={styles.cardBonus}>
              {card.startingMoney > 0 && `+${card.startingMoney}$`}
              {card.startingMoney > 0 && card.startingDays > 0 && "  "}
              {card.startingDays > 0 && `+${card.startingDays} дн.`}
            </div>
          )}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
            background: `linear-gradient(90deg, ${T.accent}, ${T.gold})`,
            borderRadius: `${T.radius} ${T.radius} 0 0`,
          }} />
        </>
      )}
    </div>
  );
}

function ActionCard({ card, index, onPlay }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        ...styles.actionCard,
        ...(hover ? styles.actionCardHover : {}),
        animation: `fadeInUp 0.4s ease ${index * 0.08}s both`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPlay(card)}
    >
      <div style={styles.actionName}>{card.cardName}</div>
      <div style={styles.actionDesc}>{card.description}</div>
      <div style={styles.actionStats}>
        <div style={styles.actionStat(T.red)}>💸 {card.moneyCost}$</div>
        <div style={styles.actionStat(T.textMuted)}>⏱ {card.timeCostDays}д</div>
        <div style={styles.actionStat(T.gold)}>🎯 {card.targetRoll}+</div>
        <div style={styles.actionStat(T.green)}>🏆 {card.rewardMoney}$</div>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
        background: hover
          ? `linear-gradient(90deg, ${T.accent}, ${T.gold})`
          : "transparent",
        transition: "background 0.3s ease",
      }} />
    </div>
  );
}

function ResultPopup({ title, body, diceRoll, success, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.popup, animation: "popIn 0.35s ease" }}>
        <div style={{
          ...styles.popupTitle,
          color: success === undefined ? T.text : success ? T.green : T.red,
        }}>
          {title}
        </div>
        {diceRoll !== undefined && (
          <div style={{
            ...styles.popupDice,
            color: success ? T.green : T.red,
            animation: "diceRoll 0.6s ease",
          }}>
            🎲 {diceRoll}
          </div>
        )}
        <div style={styles.popupBody}>{body}</div>
        <button style={styles.btn("accent")} onClick={onClose}>ОК</button>
      </div>
    </div>
  );
}

function GameOverScreen({ won, money, attempts, successes, onRestart }) {
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.popup, animation: "popIn 0.4s ease", maxWidth: "460px" }}>
        <div style={styles.gameOverTitle(won)}>
          {won ? "🎉 Оффер получен!" : "⏳ Время вышло..."}
        </div>
        <div style={{
          fontSize: "13px", color: T.textMuted, marginBottom: "8px",
        }}>
          {won
            ? "Поздравляем! Вы заработали достаточно и получили оффер мечты."
            : "Дни закончились. Попробуйте другую стратегию."}
        </div>
        <div style={styles.gameOverStats}>
          <div style={styles.gameOverStat}>
            <div style={styles.gameOverStatValue}>{money}$</div>
            <div style={styles.gameOverStatLabel}>Деньги</div>
          </div>
          <div style={styles.gameOverStat}>
            <div style={styles.gameOverStatValue}>{attempts}</div>
            <div style={styles.gameOverStatLabel}>Попытки</div>
          </div>
          <div style={styles.gameOverStat}>
            <div style={styles.gameOverStatValue}>{successes}</div>
            <div style={styles.gameOverStatLabel}>Успехи</div>
          </div>
          <div style={styles.gameOverStat}>
            <div style={{
              ...styles.gameOverStatValue,
              color: won ? T.gold : T.red,
            }}>
              {won ? "✓" : "✗"}
            </div>
            <div style={styles.gameOverStatLabel}>Результат</div>
          </div>
        </div>
        <button style={styles.btn(won ? "green" : "accent")} onClick={onRestart}>
          Сыграть ещё
        </button>
      </div>
    </div>
  );
}

function EventLog({ entries }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);
  if (!entries.length) return null;
  return (
    <div style={styles.eventLog} ref={ref}>
      <div style={styles.logTitle}>📜 Лог событий</div>
      {entries.map((e, i) => (
        <div key={i} style={styles.logEntry(e.success)}>
          {e.success ? "✓" : "✗"} {e.text}
        </div>
      ))}
    </div>
  );
}

function PlayerBar({ revealedCards }) {
  if (!revealedCards.length) return null;
  return (
    <div style={styles.playerBar}>
      {revealedCards.map((c, i) => (
        <div key={i} style={styles.miniCard}>
          <span>{CATEGORY_ICONS[c.category]}</span>
          <span>{c.cardName}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function OfferUIKit() {
  const [demoView, setDemoView] = useState("setup");
  // setup state
  const [revealed, setRevealed] = useState([false, false, false, false]);
  const [popup, setPopup] = useState(null);
  // playing state
  const [money, setMoney] = useState(500);
  const [days, setDays] = useState(14);
  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [log, setLog] = useState([]);
  const [gameOver, setGameOver] = useState(null);

  const revealedCards = SETUP_CARDS.filter((_, i) => revealed[i]);
  const allRevealed = revealed.every(Boolean);

  const handleReveal = (idx) => {
    const next = [...revealed];
    next[idx] = true;
    setRevealed(next);
    const card = SETUP_CARDS[idx];
    setPopup({
      title: card.cardName,
      body: card.backgroundStory + (card.startingMoney > 0 ? `\n\n💰 +${card.startingMoney}$` : "") + (card.startingDays > 0 ? `  ⏱ +${card.startingDays} дней` : ""),
      onClose: () => {
        setPopup(null);
        if (next.every(Boolean)) {
          setTimeout(() => setDemoView("playing"), 300);
        }
      },
    });
  };

  const handlePlayAction = (card) => {
    if (money < card.moneyCost) {
      setPopup({ title: "Не хватает денег!", body: `Нужно ${card.moneyCost}$, у вас ${money}$.`, onClose: () => setPopup(null) });
      return;
    }
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= card.targetRoll;
    const newMoney = money - card.moneyCost + (success ? card.rewardMoney : 0);
    const newDays = days - card.timeCostDays;
    const newAttempts = attempts + 1;
    const newSuccesses = successes + (success ? 1 : 0);
    setMoney(newMoney);
    setDays(newDays);
    setAttempts(newAttempts);
    setSuccesses(newSuccesses);
    setLog([...log, {
      text: `${card.cardName}: 🎲${roll} ${success ? `→ +${card.rewardMoney}$` : "→ провал"}`,
      success,
    }]);
    setPopup({
      title: success ? "Успех!" : "Провал",
      body: success
        ? `Бросок ${roll} ≥ ${card.targetRoll}. Вы заработали ${card.rewardMoney}$!`
        : `Бросок ${roll} < ${card.targetRoll}. Ресурсы потрачены зря.`,
      diceRoll: roll,
      success,
      onClose: () => {
        setPopup(null);
        if (newMoney >= 1000) setGameOver({ won: true, money: newMoney, attempts: newAttempts, successes: newSuccesses });
        else if (newDays <= 0) setGameOver({ won: false, money: newMoney, attempts: newAttempts, successes: newSuccesses });
      },
    });
  };

  const handleRestart = () => {
    setDemoView("setup");
    setRevealed([false, false, false, false]);
    setPopup(null);
    setMoney(500);
    setDays(14);
    setAttempts(0);
    setSuccesses(0);
    setLog([]);
    setGameOver(null);
  };

  return (
    <div style={styles.app}>
      <FontLoader />
      <div style={styles.bgGrid} />

      {/* Demo nav */}
      <div style={styles.demoNav}>
        {["setup", "playing", "win", "lose"].map((v) => (
          <button
            key={v}
            style={styles.demoBtn(demoView === v)}
            onClick={() => {
              setDemoView(v);
              if (v === "win") setGameOver({ won: true, money: 1050, attempts: 6, successes: 4 });
              else if (v === "lose") setGameOver({ won: false, money: 380, attempts: 8, successes: 2 });
              else setGameOver(null);
            }}
          >
            {v === "setup" ? "Предыстория" : v === "playing" ? "Игра" : v === "win" ? "Победа" : "Поражение"}
          </button>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>OFFER OF A LIFETIME</div>
        <div style={styles.statsBar}>
          {demoView === "playing" && (
            <>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>💰</span>
                <span style={{ color: money >= 1000 ? T.gold : T.text }}>{money}$</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>📅</span>
                <span style={{ color: days <= 3 ? T.red : T.text }}>{days} дн.</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>🎯</span>
                <span>1000$</span>
              </div>
            </>
          )}
          <div style={styles.phaseLabel}>
            {demoView === "setup" ? "Фаза 1: Предыстория" : "Фаза 2: Игра"}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {demoView === "setup" && (
          <>
            <div style={styles.sectionTitle}>Открой 4 карты судьбы</div>
            <div style={styles.setupGrid}>
              {SETUP_CARDS.map((card, i) => (
                <SetupCardSlot
                  key={i}
                  card={card}
                  index={i}
                  revealed={revealed[i]}
                  onReveal={handleReveal}
                />
              ))}
            </div>
            {allRevealed && (
              <button
                style={{ ...styles.btn("green"), animation: "fadeInUp 0.4s ease" }}
                onClick={() => setDemoView("playing")}
              >
                Начать игру →
              </button>
            )}
          </>
        )}

        {demoView === "playing" && (
          <>
            <div style={styles.sectionTitle}>Разыграй карту действия</div>
            <div style={styles.actionGrid}>
              {ACTION_CARDS.map((card, i) => (
                <ActionCard key={i} card={card} index={i} onPlay={handlePlayAction} />
              ))}
            </div>
            <EventLog entries={log} />
          </>
        )}
      </div>

      {/* Player bar */}
      {demoView === "playing" && <PlayerBar revealedCards={SETUP_CARDS} />}

      {/* Popups */}
      {popup && (
        <ResultPopup
          title={popup.title}
          body={popup.body}
          diceRoll={popup.diceRoll}
          success={popup.success}
          onClose={popup.onClose}
        />
      )}
      {gameOver && (
        <GameOverScreen
          won={gameOver.won}
          money={gameOver.money}
          attempts={gameOver.attempts}
          successes={gameOver.successes}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
