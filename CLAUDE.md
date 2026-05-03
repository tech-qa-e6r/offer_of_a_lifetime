# offer_of_a_lifetime — Project Context

## What this project is

A 2D card-based life simulation game made in Unity. The player builds a character backstory through setup cards, then plays action cards to navigate career/life events and earn the "offer of a lifetime".

## Repository structure

```
offer_of_a_lifetime/
├── offer_of_a_lifetime_client/   # Unity project (the game)
│   └── Assets/
│       ├── 0_Scripts/test/       # All game scripts (C#)
│       ├── 0_Cards/test/         # ScriptableObject card assets
│       ├── Prefabs/              # UI prefabs
│       └── Scenes/               # Unity scenes
└── auto_tests/                   # Automated tests (currently empty, SDET work in progress)
```

## Tech stack

- **Unity 6** (6000.4.0f1), **URP 2D**
- **C#**, TextMeshPro, Unity Input System
- **Unity Test Framework** 1.6.0 (com.unity.test-framework) — installed, ready for tests
- Git LFS is configured for binary assets

## Game mechanics

**Two phases:**

1. **Setup phase** — player clicks 4 face-down card slots. Each slot draws a random card from its pool:
   - `AgeAndBackground` — backstory/age
   - `BasicSkill` — starting skill (e.g., C#, Manual QA)
   - `StartingResources` — starting money + days (only this category applies stats)
   - `EmploymentStatus` — employed or not

2. **Playing phase** — player picks action cards (e.g., Coworking). Each card costs money + days, triggers a d20 roll vs `targetRoll`. Success → +100$, fail → resources lost.

**Player resources:** `currentMoney` ($) and `currentDays` (days until deadline).

## Key scripts

| File | Role |
|------|------|
| `GameManager.cs` | Singleton. Orchestrates phases, holds card pools, owns event log. |
| `CardData.cs` | ScriptableObject for action cards (name, cost, targetRoll). |
| `SetupCardData.cs` | ScriptableObject for setup cards (category, lore, starting stats). |
| `SetupCardSlot.cs` | UI slot that reveals a setup card on click. |

## Conventions

- Scripts live in `Assets/0_Scripts/test/`, card assets in `Assets/0_Cards/test/` — the `test/` subfolder is the active working directory (prototype stage).
- All ScriptableObjects are created via `CreateAssetMenu`.
- Event log appends to `eventLogText` (TMP) and auto-scrolls via `ScrollRect`.
- `GameManager.Instance` is the only singleton; don't add more unless discussed.

## auto_tests

Folder exists but is empty. Intended for SDET test automation (Unity Test Framework / possibly external tooling). Any test work goes here.
