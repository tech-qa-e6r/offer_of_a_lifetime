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
   After all 4 revealed → `Invoke(nameof(StartPlayingPhase), 2f)`

2. **Playing phase** — player clicks action cards. Each costs `moneyCost` + `timeCostDays`, triggers d20 roll vs `targetRoll`. Success → `+rewardMoney`, fail → resources lost.

**Player resources:** `currentMoney` ($) and `currentDays`.

## Scripts — Assets/0_Scripts/test/

| File | Role |
|------|------|
| `GameManager.cs` | Singleton (duplicate-safe Awake). Orchestrates phases, holds card pools, event log, player stats. |
| `CardData.cs` | ScriptableObject for action cards: `cardName`, `description`, `moneyCost`, `timeCostDays`, `targetRoll`, `rewardMoney`. |
| `SetupCardData.cs` | ScriptableObject for setup cards: `category`, `cardName`, `backgroundStory`, `startingMoney`, `startingDays`, `skillName`, `isCurrentlyEmployed`. |
| `SetupCardSlot.cs` | MonoBehaviour on each of the 4 setup card slots. Calls `GameManager.Instance.DrawSetupCard(this)` on click. |

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
  Setup_Panel          # shown during Setup phase only; contains Карта-1…4
    Карта - 1          # SetupCardSlot, category=AgeAndBackground
    Карта - 2          # SetupCardSlot, category=BasicSkill
    Карта - 3          # SetupCardSlot, category=StartingResources
    Карта - 4          # SetupCardSlot, category=EmploymentStatus
  Panel_2              # action phase background panel (actionPanel ref in GameManager)
  Бросить D20          # d20 button area
  Деньги/Дней text     # statsText (TMP)
  PlayerHand           # HorizontalLayoutGroup, anchor stretch full-screen, center
    Card_Dummy         # action card button (200×300), calls GameManager.PlayActionCard
      Сходить в коворкинг
  EventLogText_scroll  # ScrollRect, hidden during Setup phase
    Viewport → Content → EventLogText (TMP)
    Scrollbar Vertical
  PlayerBar            # HorizontalLayoutGroup bar at bottom (h=330px), hidden until Playing
                       # setup cards are reparented here on StartPlayingPhase()
```

## Key GameManager serialized references (scene fileIDs)

All wired in scene YAML — no manual inspector work needed:
- `logScrollRect` → EventLogText_scroll
- `setupPanel` → Setup_Panel (fileID 123862486)
- `actionPanel` → Panel_2 (fileID 1108952729)
- `statsText` → Деньги text (fileID 123879877)
- `eventLogText` → EventLogText (fileID 914871999)
- `playerBarPanel` → PlayerBar (fileID 2200000002)
- `setupCardSlots` → [Карта-1 comp 543546530, Карта-2 comp 182072307, Карта-3 comp 46668560, Карта-4 comp 1440729563]

## UI layout decisions

- **Event log** hidden during Setup phase, shown on Playing start
- **Setup cards** (Карта 1-4) reparented from Setup_Panel → PlayerBar when Playing starts
- **Action cards** (PlayerHand) anchored full-screen, cards keep intrinsic size (HLG ForceExpand=off)
- **PlayerBar** anchored bottom, height 330px, dark semi-transparent bg (0.1,0.1,0.1,0.8)

## Scene editing approach

Scene is in Git LFS — diffs show only the LFS hash. All UI changes (new GameObjects, RectTransform values, component wiring) are done by editing `SampleScene.unity` YAML directly, not in the Unity editor. This works reliably for:
- Adding new GameObjects (append YAML blocks + register fileID in parent's m_Children)
- Tweaking RectTransform values (position, size, anchors)
- Wiring serialized fields on MonoBehaviours
- Toggling m_IsActive

## Conventions

- Scripts and card assets live in `**/test/` subfolder — prototype stage, not refactored yet
- ScriptableObjects created via `CreateAssetMenu`
- Only one singleton (`GameManager.Instance`); don't add more without discussion
- No manual Unity editor steps needed — everything is file-editable

## auto_tests

Empty. Planned for SDET test automation (Unity Test Framework and/or external tooling).
