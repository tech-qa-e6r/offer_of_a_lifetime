# offer_of_a_lifetime — Project Context

## What this project is

A 2D card-based life simulation game in Unity. The player builds a character backstory through 4 setup cards, then plays action cards to navigate career/life events and earn the "offer of a lifetime".

## Repository structure

```
offer_of_a_lifetime/
├── offer_of_a_lifetime_client/   # Unity project (the game)
│   └── Assets/
│       ├── 0_Scripts/test/       # All game scripts (C#)
│       ├── 0_Cards/test/         # ScriptableObject card assets
│       ├── Prefabs/              # empty
│       └── Scenes/SampleScene.unity
└── auto_tests/                   # Empty — SDET automation work planned here
```

## Tech stack

- **Unity 6** (6000.4.0f1), **URP 2D**, reference resolution 1920×1080
- **C#**, TextMeshPro, Unity Input System
- **Unity Test Framework** 1.6.0 — installed, ready for tests
- **Git LFS** configured for binary assets (scene diffs show only LFS pointer hash)

## Game mechanics

**Two phases:**

1. **Setup phase** — player clicks 4 face-down slots, each draws a random card from its pool:
   - `AgeAndBackground` — backstory/age
   - `BasicSkill` — starting skill (e.g., C#, Manual QA)
   - `StartingResources` — applies `startingMoney` + `startingDays` to player stats
   - `EmploymentStatus` — employed or not
   After each card: `ResultPopup` shows card info + bonuses. After the 4th popup closes → `StartPlayingPhase()`.

2. **Playing phase** — player clicks action cards. Each costs `moneyCost` + `timeCostDays`, triggers d20 roll vs `targetRoll`. After each action: `ResultPopup` shows roll result. On close → `CheckGameOver()`.
   Mini cards in PlayerBar are tappable: shows `ResultPopup` with card backstory (informational only, no dice roll).

**Win condition:** `currentMoney >= targetMoney` (default 1000$) → `GameOverPanel` win.
**Lose condition:** `currentDays <= 0` after spending → `GameOverPanel` lose.

**Player resources:** `currentMoney` ($) and `currentDays`.

## Scripts — Assets/0_Scripts/test/

| File | Role |
|------|------|
| `GameManager.cs` | Singleton (duplicate-safe). Orchestrates phases, card pools, stats, popup calls, game over check. Log uses ASCII only: `[OK]`/`[X]`, `->`. |
| `CardData.cs` | ScriptableObject for action cards: `cardName`, `description`, `moneyCost`, `timeCostDays`, `targetRoll`, `rewardMoney`. |
| `SetupCardData.cs` | ScriptableObject for setup cards: `category`, `cardName`, `backgroundStory`, `startingMoney`, `startingDays`, `skillName`, `isCurrentlyEmployed`. |
| `SetupCardSlot.cs` | MonoBehaviour on each of the 4 setup card slots. Stores `_cardData` on reveal. `OnSlotClicked()`: draws card in Setup phase; shows info popup in Playing phase. `MakeMiniCard()`: hides descriptionText + gradientStrip. |
| `ResultPopup.cs` | Universal popup: `Show(title, body, onClose=null, success=null)`. Reused for setup reveals, action results, mini card info. |
| `GameOverPanel.cs` | Final screen: `Show(won, money, attempts, successes)`. ResultText is plain ASCII (no emoji). RestartButton calls `SceneManager.LoadScene(current)`. |
| `CardHoverEffect.cs` | IPointerEnterHandler/IPointerExitHandler. Shows blue border (`#638cff`, alpha 0→1) on hover via `borderImage` (CardBorder Image child of the card). GUID: `a1b2c3d4e5f60001a1b2c3d4e5f60001`. |

## GameManager fields (serialized)

```
logScrollRect, setupPanel, actionPanel, playerBarPanel, setupCardSlots[4]
statsText, eventLogText
resultPopup, gameOverPanel
currentMoney, currentDays
targetMoney = 1000
```
Private: `cardsRevealed`, `_attempts`, `_successes` — reset in `StartSetupPhase()` on each restart.

## Card assets — Assets/0_Cards/test/

| Asset | Type | Notes |
|-------|------|-------|
| `Card_Coworking_test.asset` | CardData | moneyCost=200, timeCostDays=1, targetRoll=10, rewardMoney=100 |
| `Setup_Age_test.asset` | SetupCardData | AgeAndBackground |
| `Setup_Skill_test.asset` | SetupCardData | BasicSkill |
| `Setup_Res_test.asset` | SetupCardData | StartingResources |
| `Setup_Job_test.asset` | SetupCardData | EmploymentStatus |

## Scene hierarchy — SampleScene.unity

Canvas children order (bottom z → top z):

```
main screen  (Canvas RT=1461240885, CanvasScaler 1920×1080, RenderMode=SSOverlay)
  BG                   # full-screen dark bg (#0A0E17), Image RT=0
  Header               # GO=5100000001, RT=5100000002; top-stretch, h=70px; Image RT=0
    TitleText          # GO=5100000011, TMP gradient title; left 60% of header
    statsText          # GO=123879875, TMP=123879877; right half of header (anchor {0.5,0}→{1,1})
                       # Updated by GameManager.UpdateUI() — "Деньги: X$ | Дней: Y"
    HeaderBorder       # GO=5100000021; 1px at bottom of Header, light blue 15% opacity
  Setup_Panel          # GO=123862486; Setup phase only; Image RT=0; m_IsActive=1 at start
    Карта - 1          # SetupCardSlot comp=543546530, GO=543546528, RT=543546529; category=AgeAndBackground
      Title            # GO=2071670149, m_IsActive=0 (shown by RevealCard); TMP=2071670151
      Desc             # GO=1911901767, m_IsActive=0 (shown by RevealCard); TMP=1911901769
      CardBack         # GO=76834556; hidden by RevealCard when flipped
      GradientStrip    # GO=5300000001, RT=5300000002; 3px top of card, blue; m_IsActive=0;
                       # shown by RevealCard, hidden by MakeMiniCard; wired in SetupCardSlot.gradientStrip
    Карта - 2          # comp=182072307; GO=182072305/RT=182072306; GradientStrip GO=5300000011
    Карта - 3          # comp=46668560;  GO=46668558/RT=46668559;   GradientStrip GO=5300000021
    Карта - 4          # comp=1440729563; GO=1440729561/RT=1440729562; GradientStrip GO=5300000031
                       # Each Карта has LayoutElement: preferredWidth=160, preferredHeight=60
                       # LayoutElement fileIDs: 5400000001, 5400000011, 5400000021, 5400000031
  Panel_2              # m_IsActive=0 (unused); Image RT=0
  PlayerHand           # GO=284509795; actionPanel ref; HLG ChildControlW/H=1, ForceExpand=off
                       # full-screen stretch anchor; Image RT=0; m_IsActive=0 at start
    Card_Dummy         # GO=1933227224; Button→PlayActionCard(Card_Coworking_test); Image RT=1
                       # LayoutElement comp=1933227229: preferredWidth=200, preferredHeight=300
                       # CardHoverEffect comp=1933227238 (borderImage→1933227233)
      AccentStrip      # GO=1933227234, RT=1933227235; 3px top strip, color #638cff; RT=0
      CardBorder       # GO=1933227230, RT=1933227231; stretch+4px, Sliced FillCenter=0
                       # Image=1933227233; color alpha=0 idle, alpha=1 on hover; RT=0
      Сходить в коворкинг  # child TMP label (renders on top)
  PlayerBar            # GO=2200000001, RT=2200000002; HLG comp=2200000005; Image RT=0
                       # anchor bottom, h=90px; padding L/R=20 T/B=12, spacing=15, ChildAlign=MiddleCenter
                       # ChildControlW/H=1, ForceExpand=off; m_IsActive=0, shown by StartPlayingPhase
                       # setup cards reparented here; LayoutElement makes them 160×60px mini cards
  EventLogText_scroll  # GO=2146949644, RT=2146949645; ScrollRect; Image RT=0
                       # anchor top-right, offset (-20,-90), size 380×520; m_IsActive=1 in YAML
                       # hidden by StartSetupPhase(), shown by StartPlayingPhase()
    Viewport           # Mask; Image RT=0
      Content → EventLogText  # GO=914871998, m_IsActive=1; TMP=914871999
    Scrollbar Vertical
  ResultPopup          # GO=2300000001; full-screen overlay, Image RT=1; m_IsActive=0
    PopupCard          # centered 600×420; TitleText TMP=2300000012; BodyText TMP=2300000016
      CloseButton      # comp=2300000018; onClick→ResultPopup.OnCloseClicked (comp=2300000005)
  GameOverPanel        # GO=2400000001; full-screen overlay, Image RT=1; m_IsActive=0
    GameOverCard       # centered 600×420; ResultText TMP=2400000012; StatsText TMP=2400000016
      RestartButton    # comp=2400000018; onClick→GameOverPanel.OnRestartClicked (comp=2400000005)
```

## RaycastTarget policy

Only interactive elements have `m_RaycastTarget: 1`. Backgrounds always `0`:

| RT=1 (interactive) | RT=0 (background/container) |
|---|---|
| Карта-1..4 Images (setup card slots) | BG, Header, Setup_Panel, Panel_2 |
| CardBack Images | PlayerHand, PlayerBar |
| Card_Dummy Image | EventLogText_scroll (Viewport RT=0 too) |
| ResultPopup, PopupCard, CloseButton | GradientStrips |
| GameOverPanel, GameOverCard, RestartButton | HeaderBorder |
| Scrollbar Handle | |

## Key GameManager serialized references (scene fileIDs)

All wired in scene YAML — no manual inspector work needed:
- `logScrollRect` → EventLogText_scroll ScrollRect comp (fileID 2146949646)
- `setupPanel` → Setup_Panel GO (fileID 123862486)
- `actionPanel` → PlayerHand GO (fileID 284509795)
- `statsText` → TMP comp fileID 123879877 (inside Header GO)
- `eventLogText` → TMP comp fileID 914871999 (GO 914871998, "EventLogText")
- `playerBarPanel` → PlayerBar RT (fileID 2200000002)
- `setupCardSlots` → comps [543546530, 182072307, 46668560, 1440729563]
- `resultPopup` → ResultPopup script comp (fileID 2300000005)
- `gameOverPanel` → GameOverPanel script comp (fileID 2400000005)
- `targetMoney` = 1000

## Script GUIDs (for scene YAML references)

| Script | GUID |
|--------|------|
| GameManager | ade62bd9dfcfe4da395af22723cb0c09 |
| SetupCardSlot | 3b7a97125903e4ef8b5292c4cfd0804e |
| CardHoverEffect | a1b2c3d4e5f60001a1b2c3d4e5f60001 |
| ResultPopup | c1b2a3f4e5d60001c1b2a3f4e5d60001 |
| GameOverPanel | c1b2a3f4e5d60002c1b2a3f4e5d60002 |
| TMP (TextMeshProUGUI) | f4688fdb7df04437aeb418b961361dc5 |
| Image | fe87c0e1cc204ed48ad3b37840f39efc |
| Button | 4e29b1a8efbd4b44bb3f3716e73f07ff |
| HorizontalLayoutGroup | 30649d3a9faa99c48a7b1166b86bf2a0 |
| LayoutElement | 306cc8c2b49d7114eaa3623786fc2126 |
| TMP font asset | 8f586378b4e144a9851e7b34d9b748ee |

## UI layout decisions

- **Header** is a 70px bar at top; contains TitleText (left) and statsText (right); HeaderBorder at its bottom edge
- **statsText** lives INSIDE Header RT — not a direct Canvas child
- **Event log** positioned top-right (380×520); hidden in Setup, shown in Playing
- **Setup cards** reparented from Setup_Panel → PlayerBar on phase transition; LayoutElement gives them 160×60px mini size
- **GradientStrips** shown on card reveal (RevealCard), hidden on mini card transition (MakeMiniCard) to avoid visual stripe artifact
- **Action cards** (PlayerHand) full-screen HLG container; Card_Dummy has explicit LayoutElement so HLG sizes it correctly
- **PlayerBar** anchored bottom, h=330px, dark semi-transparent bg; HLG centers mini cards (MiddleCenter)
- **Popups** are full-screen overlays (RT=true) — block all clicks behind them; ResultPopup reused for setup reveals, action results, and mini card info
- **Dice roll** is automatic inside PlayActionCard() — no separate button
- **Font limitation** — LiberationSans SDF does NOT support emoji or special Unicode (✓ ✗ → 🎲 etc). All game strings must use ASCII: `[OK]`, `[X]`, `->`. Russian Cyrillic is supported via TMP fallback.
- **CardHoverEffect** — border is a child Image (CardBorder) with Sliced type and FillCenter=0, alpha 0 idle → 1 on hover. AccentStrip is a 3px top-anchor Image always visible (#638cff).
- **FileID ranges for Card_Dummy additions** — AccentStrip: 1933227234–1933227237, CardBorder: 1933227230–1933227233, CardHoverEffect comp: 1933227238

## Scene editing approach

Scene is in Git LFS — diffs show only the LFS hash. All UI changes done by editing `SampleScene.unity` YAML directly:
- New GO: append YAML blocks + add RT fileID to parent's `m_Children`
- New script ref in scene: add to GameManager MonoBehaviour block (fileID 958324828)
- New script: also create `.meta` with matching GUID
- When replacing strings in YAML, use `--- !u!224 &{rt_fileid}` as unique block anchor (not m_Children patterns which can repeat)
- FileID ranges used: Header=5100000xxx, ResultPopup=2300000xxx, GameOverPanel=2400000xxx, PlayerBar=2200000xxx, GradientStrips=5300000xxx, LayoutElements=5400000xxx

## Conventions

- Scripts and card assets live in `**/test/` subfolder — prototype stage
- ScriptableObjects via `CreateAssetMenu`
- Only one singleton (`GameManager.Instance`)
- No manual Unity editor steps — everything is file-editable

## auto_tests

Empty. Planned for SDET test automation (Unity Test Framework and/or external tooling).
