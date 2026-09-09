# Foundations — Design Review and Decisions

Reviewed 2026-09-09. The user approved the rules baseline with revised startup, population, and Wonder scope. The [implementation rules](07-rules.md) are the authoritative numerical specification. Documents 00–05 are reconciled system views. Values need balance playtesting; approval is not evidence of tested pacing.

## Confirmed baseline

- Foundations is the game title; CivClicker references identify inspiration only.
- Desktop browsers using Three.js; start screen, New Game, Continue, Load Game, Settings, save slots, and export/import.
- No offline production, prestige restart rewards, or cross-save unlocks.
- Start with 200 Food, 200 Wood, and 200 Stone; one Barn, one Wood Stockpile, one Stone Stockpile; no Workers and no housing.
- Discovery technologies cost basic resources. Buy Masonry and a Cottage to obtain the first housing without requiring Skins or Workers.
- One Worker population pool; Science/Librarians and Happiness are included.
- Science replaces most technology resource costs after Writing.
- Food shortages cause deaths after a grace period; manual gathering supports recovery.
- Wonders are buildable visual milestones with no bonuses. Seven freestanding models mix ancient and modern selections; see the [roster](04-wonders.md#seven-wonder-types).

## Resolved review findings

| Area | Resolution |
|---|---|
| Startup circular dependencies | Exact starting inventory; basic-resource discovery costs; Masonry/Cottage route before any Workers |
| Missing job rates and resource rules | Explicit rates, secondary output, conversions, caps, modifier order, and fractional accounting |
| Science and Libraries absent | Library cost/capacity/rate; Writing unlock; exact Science technology prices |
| Undefined Happiness and health | Explicit crowding, sickness, healing, consumption, starvation, and burial formulas |
| Ambiguous Devotion consumption | Altar-count threshold value is never spent; ability Piety costs remain separate |
| Unspecified original-game formulas | Explicit Foundations formulas replace fallback references to CivClicker |
| Conflicting Ages and prerequisites | Technology costs and Age gates reconciled; earlier technologies remain purchasable |
| Mixed workforce allocation | Protected manual assignments; defined denominator, rounding, capacity, and sickness handling |
| Placement can block economy | Expandable visual terrain; queued placement retries; immediate economic ownership |
| Missing purchase semantics | Instant effects, exact unlocks, atomic bulk purchases, Mill rounding, no demolition |
| Incomplete Wonder construction | Exact work/resources, shortage behavior, completion transition, persistence, and seven models |
| Wonder reward ambiguity | No rewards or bonus-choice state; completion is visual only |
| Incomplete religion | Exact passive/action costs, effects, timers, sacrifice behavior, and Cat acquisition |
| Missing session lifecycle | Save schema, backup, slots, start screen, pause rules, and no offline catch-up |
| Undefined technology visibility | Full costs/effects/prerequisites visible across Ages; locked purchases explain requirements |

## Remaining delivery work

Agree reference hardware and measurable frame-rate, load-time, save-time, and large-settlement benchmark targets before implementation. Gameplay baseline approval does not establish performance results.

Validate a fresh save through all five Ages and a completed Wonder; recovery from zero Food/population; all three religions in separate saves; fractional production and full storage; assignment rounding and capacity; sickness/deaths; Wonder shortages/completion and all seven models; placement expansion; save/load continuity; and paused/closed-session behavior.

This review resolves the identified design conflicts. Implementation and playtesting may reveal further questions; record new decisions explicitly rather than inferring original-game behavior.
