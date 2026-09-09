# Foundations — Religion

## Overview

Foundations takes inspiration from CivClicker's deity system. Its own explicit rules define behavior; unspecified original mechanics are not requirements.

The player first produces Piety through Clerics, then unlocks Worship and chooses one deity path.

The initial non-warfare version includes:

- The Fields
- The Underworld
- Cats

The Battle branch is reserved for the future warfare module.

## Unlocking Religion

Requirements:

- at least 1 Temple
- Worship technology
- 1,000 Piety for Worship

After Worship is unlocked, choosing a deity costs:

- **500 Piety**

Choose one deity permanently for the current settlement; deity switching is excluded.

## Temples

Base Temple cost:

- 30 Wood
- 120 Stone
- 10 Herbs

Effect:

- allows 1 Cleric

Clerics:

- generate Piety;
- bury corpses when grave capacity exists.

Base Piety generation:

- **0.05 Piety/s per Cleric**

Writing improves Cleric Piety output.

Aesthetics causes Temple construction to improve Happiness.

## Devotion

Each deity has a dedicated Altar.

Each Altar adds:

- **+1 Devotion**

Abilities unlock at:

- 10 Devotion
- 20 Devotion
- 30 Devotion
- 40 Devotion
- 50 Devotion

Devotion equals the number of owned altars and is never spent. Thresholds unlock access; priced passive abilities require a one-time purchase.

# The Bounty of the Fields

The Fields is the production-oriented religion.

## Fields Altar

Base cost:

- 500 Food
- 500 Wood
- 200 Stone
- 200 Piety

Effect:

- +1 Devotion

Placement:

- rural shrines, farms, or agricultural outskirts

## 10 Devotion — Blessing of Abundance

Cost:

- 1,000 Piety

Effect:

- increases Farmer Food output.

The exact Foundations production bonus is specified in the [implementation rules](07-rules.md#religion).

## 20 Devotion — Burn Wicker Man

Cost:

- 500 Wood
- 1 Worker

Effect:

- grants a random resource bonus.

The Worker cost is intentionally retained from the original game.

Visual:

- temporary festival / wicker structure appears outside dense housing.

## 30 Devotion — Abide No Waste

Cost:

- 1,000 Piety

Effect:

- if Food reaches zero, Workers can consume Corpses before starving.

This intentionally preserves the original game's rather cheerful definition of agricultural efficiency.

## 40 Devotion — Walk Behind the Rows

Effect:

- continuously consumes Workers over time to boost Food production.

Original behavior:

- exactly 1 Worker per active simulation second, with stop conditions defined in the implementation rules.

The ability must have a clear toggle:

- Walk Behind the Rows
- Cease Walking

## 50 Devotion — Reserved Trade Bonus

Original ability:

- Stay With Us — traders stay longer.

Because Trade is excluded, this ability is **inactive/reserved** in the initial version.

Do not replace it with a new bonus yet unless specifically requested.

# The Dread Power of the Underworld

The Underworld focuses on death, corpses, burial, and Piety.

## Underworld Altar

Base cost:

- 200 Stone
- 200 Piety
- 1 Corpse

Effect:

- +1 Devotion

Placement:

- near Graveyards or funerary district

## 10 Devotion — The Book of the Dead

Cost:

- 1,000 Piety

Effect:

- gain Piety when Workers die.

## 20 Devotion — Inactive

There is no ability at this threshold in the initial version.

## 30 Devotion — A Feast for Crows

Cost:

- 1,000 Piety

Effect:

- Corpses are less likely to cause illness.

## 40 Devotion — Reserved Warfare Ability

Original ability:

- Summon Shades — defeated enemies can rise to fight.

Because warfare is excluded, this ability is inactive/reserved.

## 50 Devotion — Secrets of the Tombs

Cost:

- 5,000 Piety

Effect:

- Graveyards increase Cleric Piety generation.

# The Grace of Cats

Cats focuses on Happiness, health, and Cats.

## Cat Altar

Base cost:

- 200 Stone
- 200 Piety
- 100 Herbs

Effect:

- +1 Devotion

Placement:

- residential or Temple district

## 10 Devotion — Lure of Civilisation

Cost:

- 1,000 Piety

Effect:

- increases the chance to gain Cats.

## 20 Devotion — Pest Control

Cost:

- 100 Piety

Effect:

- temporary boost to Food production.

## 30 Devotion — Warmth of the Companion

Cost:

- 1,000 Piety

Effect:

- Cats help heal Sick workers.

## 40 Devotion — Grace

Cost:

- 1,000 Piety

Effect:

- increases Happiness.

## 50 Devotion — Reserved Trade Bonus

Original ability:

- Comfort of the Hearthfires — traders arrive more frequently.

Because Trade is excluded, this ability is inactive/reserved.

# Battle

The original Battle deity branch is excluded from the initial design because every major ability depends on soldiers, raids, enemies, or invasions.

Reserve:

- Battle Altar
- Riddle of Steel
- Smite Invaders
- Throne of Skulls
- For Glory!
- Lament of the Defeated

Do not redistribute these bonuses into the civilian economy.

## Iconoclasm

Original cost:

- 1,000 Piety

Effect:

- removes an old deity / allows deity history management.

Keep the mechanic reserved for the later prestige/pantheon system.

## Visual Religion Rules

Religion changes visual details but does not give the player placement control.

### Fields

Possible visual effects:

- crop shrines
- harvest banners
- wreaths
- wicker figures
- richer agricultural decoration

### Underworld

Possible visual effects:

- grave markers
- dark stone monuments
- funerary processions
- mausoleum details

### Cats

Possible visual effects:

- cats in streets and homes
- feline statues
- food bowls near houses
- cats sitting in places specifically selected to inconvenience pedestrian traffic

Visual religion should make two civilizations with the same economy look noticeably different without changing the automatic layout rules.

## Exact ability rules

The [implementation rules](07-rules.md#religion) define exact output modifiers, costs, timers, sacrifice effects, Cat acquisition, and healing. Underworld has no ability at 20 Devotion. All abilities marked inactive or reserved are unavailable in the first release.
