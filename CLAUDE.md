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

**Win condition:** `currentMoney >= targetMoney` (default 1000$) → `GameOverPanel` win.
**Lose condition:** `currentDays <= 0` after spending → `GameOverPanel` lose.

**Player resources:** `currentMoney` ($) and `currentDays`.

## Scripts — Assets/0_Scripts/test/

| File | Role |
|------|------|
| `GameManager.cs` | Singleton (duplicate-safe). Orchestrates phases, card pools, stats, popup calls, game over check. |
| `CardData.cs` | ScriptableObject for action cards: `cardName`, `description`, `moneyCost`, `timeCostDays`, `targetRoll`, `rewardMoney`. |
| `SetupCardData.cs` | ScriptableObject for setup cards: `category`, `cardName`, `backgroundStory`, `startingMoney`, `startingDays`, `skillName`, `isCurrentlyEmployed`. |
| `SetupCardSlot.cs` | MonoBehaviour on each of the 4 setup card slots. Calls `GameManager.Instance.DrawSetupCard(this)` on click. |
| `ResultPopup.cs` | Universal popup: `Show(title, body, onClose)`. Activated by GameManager after each setup card and each action card. OnCloseClicked() fires the callback. |
| `GameOverPanel.cs` | Final screen: `Show(won, money, attempts, successes)`. RestartButton calls `SceneManager.LoadScene(current)`. |

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

```
main screen  (Canvas, CanvasScaler 1920×1080)
  BG
  Setup_Panel          # Setup phase only; contains Карта-1…4
    Карта - 1          # SetupCardSlot, category=AgeAndBackground,    comp=543546530
    Карта - 2          # SetupCardSlot, category=BasicSkill,          comp=182072307
    Карта - 3          # SetupCardSlot, category=StartingResources,   comp=46668560
    Карта - 4          # SetupCardSlot, category=EmploymentStatus,    comp=1440729563
  Panel_2              # actionPanel ref, Playing phase bg
  Бросить D20          # d20 button
  Деньги/Дней text     # statsText (TMP), fileID=123879877
  PlayerHand           # HLG full-screen, ForceExpand=off
    Card_Dummy         # 200×300, calls GameManager.PlayActionCard → Card_Coworking_test
      Сходить в коворкинг
  EventLogText_scroll  # ScrollRect, hidden during Setup
    Viewport → Content → EventLogText (TMP, fileID=914871999)
    Scrollbar Vertical
  PlayerBar            # HLG bar at bottom h=330px, m_IsActive=0, shown on StartPlayingPhase
                       # setup cards reparented here from Setup_Panel on phase transition
  ResultPopup          # full-screen overlay (dark 70%), m_IsActive=0, fileID=2300000001
    PopupCard          # centered 600×420, light bg
      TitleText        # TMP 32px bold, fileID=2300000012
      BodyText         # TMP 22px wrap, fileID=2300000016
      CloseButton      # blue, onClick→ResultPopup.OnCloseClicked (comp=2300000005)
        CloseButtonText  # "ОК"
  GameOverPanel        # full-screen overlay (dark 70%), m_IsActive=0, fileID=2400000001
    GameOverCard       # centered 600×420, light bg
      ResultText       # TMP 36px bold, fileID=2400000012
      StatsText        # TMP 24px wrap, fileID=2400000016
      RestartButton    # green, onClick→GameOverPanel.OnRestartClicked (comp=2400000005)
        RestartButtonText  # "Сыграть ещё"
```

## Key GameManager serialized references (scene fileIDs)

All wired in scene YAML — no manual inspector work needed:
- `logScrollRect` → EventLogText_scroll (fileID 2146949646)
- `setupPanel` → Setup_Panel (fileID 123862486)
- `actionPanel` → Panel_2 (fileID 1108952729)
- `statsText` → fileID 123879877
- `eventLogText` → fileID 914871999
- `playerBarPanel` → PlayerBar (fileID 2200000002)
- `setupCardSlots` → comps [543546530, 182072307, 46668560, 1440729563]
- `resultPopup` → ResultPopup script comp (fileID 2300000005)
- `gameOverPanel` → GameOverPanel script comp (fileID 2400000005)
- `targetMoney` = 1000

## Script GUIDs (for scene YAML references)

| Script | GUID |
|--------|------|
| GameManager | ade62bd9dfcfe4da395af22723cb0c09 |
| SetupCardSlot | 3b7a97125903e4ef8b5292c4cfd0804e |
| ResultPopup | c1b2a3f4e5d60001c1b2a3f4e5d60001 |
| GameOverPanel | c1b2a3f4e5d60002c1b2a3f4e5d60002 |
| TMP (TextMeshProUGUI) | f4688fdb7df04437aeb418b961361dc5 |
| Image | fe87c0e1cc204ed48ad3b37840f39efc |
| Button | 4e29b1a8efbd4b44bb3f3716e73f07ff |
| HorizontalLayoutGroup | 30649d3a9faa99c48a7b1166b86bf2a0 |
| TMP font asset | 8f586378b4e144a9851e7b34d9b748ee |

## UI layout decisions

- **Event log** hidden during Setup phase, shown on Playing start
- **Setup cards** reparented from Setup_Panel → PlayerBar when Playing starts
- **Action cards** (PlayerHand) anchored full-screen, cards keep intrinsic 200×300 size
- **PlayerBar** anchored bottom, height 330px, dark semi-transparent bg
- **Popups** are full-screen overlays (RaycastTarget=true) — block all clicks behind them
- **ResultPopup** is reused for both setup card reveals and action card results

## Scene editing approach

Scene is in Git LFS — diffs show only the LFS hash. All UI changes done by editing `SampleScene.unity` YAML directly:
- New GO: append YAML blocks + add RT fileID to parent's `m_Children`
- New script ref in scene: add to GameManager MonoBehaviour block (fileID 958324828)
- New script: also create `.meta` with matching GUID
- FileID ranges used: PlayerBar=2200000xxx, ResultPopup=2300000xxx, GameOverPanel=2400000xxx

## Conventions

- Scripts and card assets live in `**/test/` subfolder — prototype stage
- ScriptableObjects via `CreateAssetMenu`
- Only one singleton (`GameManager.Instance`)
- No manual Unity editor steps — everything is file-editable

## auto_tests

Empty. Planned for SDET test automation (Unity Test Framework and/or external tooling).
