# Foundations — Wonders

## Purpose

Wonders are buildable visual milestones. They grant **no bonuses**: no production modifiers, Happiness, resources, technology unlocks, or prestige rewards. There is no reward selection after completion and no bonus field in Wonder save data.

## Unlock and selection

Architecture unlocks all seven types in City Age. The player selects a type and may name the project; the settlement places it automatically. Allow one active project at a time, with any number of completed projects. Types may be built repeatedly. Type selection cannot change after starting.

## Seven Wonder types

Use a mix of ancient and modern Wonders that work as freestanding landmarks. Models are stylized, recognizable interpretations, not archaeological reconstructions.

| Type ID | Wonder model | Visual direction |
|---|---|---|
| great_pyramid | Great Pyramid of Giza | Freestanding stone pyramid with a square footprint |
| hanging_gardens | Hanging Gardens of Babylon | Stylized freestanding terraces with dense greenery and cascading water |
| lighthouse | Lighthouse of Alexandria | Tall tiered tower with a beacon; does not require a coastline |
| colossus | Colossus of Rhodes | Monumental standing bronze figure on a pedestal; does not require a harbor |
| mausoleum | Mausoleum at Halicarnassus | Raised monumental tomb, colonnade, and stepped roof |
| taj_mahal | Taj Mahal | Domed central mausoleum and four minarets within one reserved site |
| el_castillo | El Castillo at Chichén Itzá | Stepped pyramid with broad stairways and a summit temple |

Petra and terrain-dependent wall structures are excluded. All seven models use identical economic rules. Religion may add cosmetic motifs while preserving their recognizable form.

## Construction

Starting a project costs nothing and unlocks the Labourer job without a building capacity limit. Each Labourer contributes up to 1 work unit per second.

Each project requires 100,000 work units. Each unit consumes 1 Wood, 1 Stone, 0.1 Leather, and 0.1 Metal. Total cost is 100,000 Wood, 100,000 Stone, 10,000 Leather, and 10,000 Metal. Costs do not escalate between projects.

Per tick:

```text
work = min(Labourers, remainingWork, Wood, Stone, Leather / 0.1, Metal / 0.1)
```

Consume all required resources atomically for the work completed. Partial work is allowed; if any required resource is zero, progress stops. Labourers remain assigned during shortages, and the UI identifies limiting resources. Pause by unassigning Labourers. No cancellation, refunds, or Gold acceleration in the first release.

## Visual construction

Stages begin at 0%, 5%, 20%, 40%, 60%, 85%, and 100%: cleared site, foundations, lower structure/scaffolding, middle structure, upper structure, ornamentation, completed Wonder. Each of the seven types needs all seven stages. Visual progress follows actual work completion.

## Automatic placement

Reserve sufficient space for the complete selected model. Prefer a site visible from the city center, with road access and prominent terrain. Extend terrain or reroute roads as needed; never delete existing buildings. A visual placement failure queues a retry and does not erase ownership or block economic progress. No model requires a particular coastline, cliff, or waterway.

## Completion and persistence

At completion, mark the project complete immediately, release Labourers to Unemployed, reset its automatic target to 0%, and disable the job until another project starts. Another project may begin immediately. There is no bonus-selection state.

Save the name, stable type ID, work/completion state, completion order, civilization name, and model ID. Default names and name validation follow the [implementation rules](07-rules.md#wonders). Save/load preserves progress and completed models, but never grants a mechanical reward. Completing all seven types is optional; the settlement remains playable indefinitely.
