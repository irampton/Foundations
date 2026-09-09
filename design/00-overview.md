# Foundations — Game Overview

## Design Goal

**Foundations** is an incremental city-building game inspired by **CivClicker**, presented through a living 3D settlement. CivClicker is inspiration, not an implicit source of requirements: Foundations must specify its own rules and formulas.

The game remains an incremental/clicker game. The player controls **what the civilization does**, but does not manually place individual buildings or roads.

The core rule is:

> **The player makes economic decisions. The settlement decides where to build.**

This first version intentionally excludes warfare and diplomacy. Workers share one population pool with no age, family, or demographic simulation. Science, Librarians, and Happiness are included in the first release; exact rules are defined in the [implementation rules](07-rules.md).

Later versions will expand on these ideas.

## Platform and Session Lifecycle

Foundations targets desktop browsers using **Three.js**. Include a start screen with new-game and save/load access. The simulation runs only while the game is open; there is no offline production or elapsed-time catch-up after closing the game. There are no prestige restart rewards or cross-save bonus unlocks.

Science replaces most technology resource costs after Writing. Food shortages cause Worker deaths after a short grace period, and manual gathering must support recovery. Exact prices and timing are defined in the [implementation rules](07-rules.md).

## Core Loop

1. Start with 200 Food, 200 Wood, and 200 Stone, one Barn and one of each Stockpile, no Workers, and no housing. Manually gather additional basic resources as needed.
2. Buy Masonry and a Cottage to obtain the first housing; build more housing to increase maximum population.
3. Spend Food to create Workers.
4. Assign Workers to jobs.
5. Workers automate resource production.
6. Build specialized structures to unlock advanced jobs.
7. Buy technologies that improve production or unlock new systems.
8. Advance through Ages.
9. Establish a religion and gain Devotion bonuses.
10. Construct Wonders as visual milestones; they grant no bonuses.

The game should preserve the original's shift from lots of micromanagement toward full automation.

## Player Inputs

### Manual Gathering

The player starts with three basic actions:

- Gather Food
- Cut Wood
- Mine Stone

Each action initially produces 1 unit per click.

Technology can improve manual gathering later, as in the original game.

### Population

Population remains deliberately simple.

- Workers cost **20 Food each**.
- Workers require available housing capacity.
- New Workers begin as **Unemployed**.
- Workers can be reassigned freely between available jobs.
- No children, aging, households, birth rate, or immigration are simulated in the initial design.

### Jobs

Initial jobs:

- Farmer — produces Food
- Woodcutter — produces Wood
- Miner — produces Stone

Advanced jobs:

- Tanner — converts Skins into Leather
- Blacksmith — converts Ore into Metal
- Apothecary — cures Sick workers
- Cleric — produces Piety and handles corpses
- Librarian — produces Science
- Labourer — contributes to Wonder construction

Warfare jobs are omitted. More jobs will be added later.

## Workforce Controls

### Early Game: Direct Assignment

Workers are assigned with direct quantity controls:

- `-All`
- `-100`
- `-10`
- `-1`
- `+1`
- `+10`
- `+100`
- `Max`
- Custom amount

This intentionally keeps the early game close to CivClicker.

### Later Game: Percentage Controls

Percentage-based workforce controls unlock later through the Technology tree.

They are intended to reduce late-game bookkeeping without changing the underlying economy.

Once unlocked, each eligible job can be assigned a target percentage of healthy Workers remaining after manual assignments.

Example:

- Farmers: 50%
- Woodcutters: 25%
- Miners: 15%
- Tanners: 5%
- Blacksmiths: 5%

The game automatically moves workers between jobs to approach those targets.

Rules:

- Percentages are targets, not guaranteed counts.
- A job cannot exceed its building capacity.
- Remaining workers stay Unemployed.
- If total targets exceed 100%, values are normalized proportionally.
- Manual assignment remains available after percentage controls unlock.
- A player can switch a job between **Manual** and **Automatic %** mode.

Unlock: **Administration**, in the Town Age.

## Ages

Ages organize the technology tree and provide visible settlement progression. They do not replace technologies; they gate groups of technologies and visual styles.

### Age I — Settlement

Focus:

- manual gathering
- basic workers
- tents and huts
- discovery of special resources

### Age II — Village

Focus:

- masonry
- cottages
- specialized workshops
- basic agricultural improvements and Mills
- temples and religion

### Age III — Town

Focus:

- construction
- houses
- stronger storage
- administration
- percentage workforce controls

### Age IV — City

Focus:

- architecture
- mansions
- advanced farming
- aesthetics
- civil institutions
- Wonder construction

### Age V — Developed City

Focus:

- Civil Service
- Feudalism
- Guilds
- Serfs
- large-scale production optimization

The name of Age V can change later if the game's historical scope is expanded.

## Age Advancement

A player advances an Age by buying the key technology at the end of the current Age.

Age gates:

- Settlement → Village: **Masonry**
- Village → Town: **Construction**
- Town → City: **Architecture**
- City → Developed City: **Civil Service**

Age advancement should not require arbitrary population thresholds unless balance testing shows a need.

## 3D Settlement Rules

The simulation owns placement.

The player buys a building type and quantity. The city generator chooses locations.

### Placement Priorities

Buildings use weighted placement rules rather than fixed tiles.

Typical priorities:

- Housing clusters near existing housing and roads.
- Barns prefer the edge between housing and agricultural land.
- Wood Stockpiles prefer forest-facing or workshop-adjacent edges.
- Stone Stockpiles prefer quarries, mines, or industrial districts.
- Tanneries and Smithies prefer industrial clusters away from dense housing.
- Apothecaries prefer populated areas.
- Temples prefer central, elevated, or visually prominent sites.
- Mills prefer open agricultural areas and roads.
- Graveyards prefer the settlement edge and avoid housing centers.
- Wonders receive a prominent reserved site.

### Roads

Roads are automatic.

A building connects to the nearest suitable road. If none is nearby, the settlement generates a road toward the nearest connected district.

Road appearance upgrades visually with Age but does not initially affect production.

### Density

As the settlement grows:

- early housing is scattered;
- later housing forms streets and blocks;
- specialized buildings form recognizable districts;
- new buildings first fill reasonable gaps, then expand outward.

Placement is primarily visual. Economic effects come from owned building counts, not exact coordinates.

## Visual Population

The rendered citizens are representative, not one-to-one simulation objects at large populations.

At low population, most or all workers can appear as individual agents. At larger populations, the renderer may use representative crowds while economic calculations remain exact.

## Systems Excluded From Initial Version

The following original CivClicker systems are intentionally omitted for now:

- raids
- invasions
- soldiers
- cavalry
- siege engines
- fortifications as a combat mechanic
- enemy settlements
- trading post
- traders
- Gold-driven trade
- diplomacy

Gold may remain reserved for later use but is not required by the initial economy.

## Design Constraint

Do not convert this into a manual city builder.

Building location, road layout, individual worker movement, and district geometry should be consequences of the economy rather than optimization puzzles.
