# Foundations — Technology and Ages

## Purpose

Foundations uses CivClicker's upgrades as inspiration, reorganized into an Age-based tree. Effects require explicit Foundations formulas; no unspecified original-game behavior is binding.

The main changes are:

- technologies are grouped by Age;
- warfare and diplomacy technologies are omitted;
- Administration unlocks percentage workforce controls;
- Science replaces most technology resource costs after Writing.

All listed prices are final baseline prices. See [implementation rules](07-rules.md#science-and-technology) for shared research and prerequisite rules.

## Age I — Settlement

### Skinning

Cost:

- 10 Wood

Effect:

- Farmers can collect Skins.

### Harvesting

Cost:

- 10 Wood

Effect:

- Woodcutters can collect Herbs.

### Prospecting

Cost:

- 10 Stone

Effect:

- Miners can collect Ore.

### Masonry — Age Advancement

Cost:

- 100 Wood
- 100 Stone

Effect:

- unlocks Village Age;
- unlocks Cottages and core specialized buildings;
- unlocks basic agricultural improvements.

## Age II — Village

### Domestication

Prerequisite:

- Masonry

Cost:

- 20 Leather

Effect:

- **+0.1 Food/s per Farmer**.

### Ploughshares

Prerequisite:

- Masonry

Cost:

- 20 Metal

Effect:

- **+0.1 Food/s per Farmer**.

### Irrigation

Prerequisite:

- Masonry

Cost:

- 500 Wood
- 200 Stone

Effect:

- **+0.1 Food/s per Farmer**.

Visual effect:

- irrigation ditches, channels, or improved farm plots may appear automatically.

### The Wheel

Cost:

- 500 Wood
- 500 Stone

Effect:

- unlocks Mills.

### Writing

Cost:

- 500 Skins

Effect:

- doubles Cleric Piety generation;
- unlocks Libraries, each allowing 1 Librarian producing 0.1 Science/s.

Visual effect:

- written signs, tablets, scroll props, or script motifs can begin appearing around Temples.

### Worship

Prerequisite:

- at least 1 Temple

Cost:

- 1,000 Piety

Effect:

- unlocks deity selection.

### Construction — Age Advancement

Prerequisite:

- Writing

Cost:

- 100 Science

Effect:

- unlocks Town Age;
- unlocks Houses and stronger settlement infrastructure;
- unlocks improved special-resource gathering.

## Age III — Town

### Butchering

Prerequisites:

- Construction
- Skinning

Cost:

- 40 Science

Effect:

- doubles automatic Skins output.

### Gardening

Prerequisites:

- Construction
- Harvesting

Cost:

- 40 Science

Effect:

- doubles automatic Herbs output.

### Extraction

Prerequisites:

- Construction
- Prospecting

Cost:

- 40 Science

Effect:

- doubles automatic Ore output.

### Tenements

Cost:

- 100 Science

Effect:

- Houses provide **+2 additional maximum population** each.

### Slums

Prerequisite:

- Tenements

Cost:

- 200 Science

Effect:

- Houses provide another **+2 maximum population** each.

### Granaries

Cost:

- 200 Science

Effect:

- Barn storage doubles from **+200 Food to +400 Food** each.

### Code of Laws

Prerequisite:

- Writing

Cost:

- 200 Science

Effect:

- halves the Happiness overcrowding penalty.

### Administration

Prerequisite:

- Writing

Cost:

- 200 Science

Original warfare-related effect is removed.

New effect:

- unlocks **Percentage Workforce Controls**.

#### Percentage Workforce Controls

Each job can be placed in one of two modes:

**Manual**

- existing direct +1/+10/+100/Max assignment

**Target %**

- player sets a percentage of healthy Workers remaining after manual assignments for that job
- assignments rebalance automatically

Rules:

- targets can be entered directly or adjusted with ±1%, ±5%, and ±10% controls;
- total target values may be below 100%, leaving Workers Unemployed;
- if targets exceed 100%, they are normalized proportionally;
- building capacity always overrides target percentage;
- percentage automation does not create or remove Workers;
- percentage automation does not move Sick workers.

### Architecture — Age Advancement

Cost:

- 1,000 Science

Effect:

- unlocks City Age;
- unlocks Mansions;
- unlocks advanced agricultural and cultural technologies;
- unlocks Wonder construction.

## Age IV — City

### Flensing

Prerequisite:

- Architecture

Cost:

- 500 Science

Effect:

- doubles automatic Skins output again; requires Skinning and Butchering.

### Macerating

Prerequisite:

- Architecture

Cost:

- 500 Science

Effect:

- doubles automatic Ore output again; requires Prospecting and Extraction.

### Crop Rotation

Prerequisite:

- Architecture

Cost:

- 1,000 Science

Effect:

- adds 0.2 Food/s per Farmer before multipliers.

### Selective Breeding

Prerequisite:

- Architecture

Cost:

- 1,000 Science

Effect:

- adds 0.2 Food/s per Farmer before multipliers.

### Fertilisers

Prerequisite:

- Architecture

Cost:

- 1,000 Science

Effect:

- adds 0.2 Food/s per Farmer before multipliers.

### Aesthetics

Prerequisites:

- Writing
- Architecture

Cost:

- 1,000 Science

Effect:

- adds min(20, 2 × Temples) Happiness, including existing Temples.

This should also visibly increase civic ornamentation around Temples and important roads.

### Civil Service — Age Advancement

Cost:

- 2,000 Science

Effect:

- adds 1 basic resource per manual click;
- unlocks Developed City Age.

## Age V — Developed City

### Feudalism

Prerequisite:

- Civil Service

Cost:

- 3,000 Science

Effect:

- adds another 1 basic resource per manual click.

### Guilds

Prerequisite:

- Civil Service

Cost:

- 3,000 Science

Effect:

- doubles all automatic secondary-resource rates; manual clicks do not produce secondary resources.

### Serfs

Prerequisite:

- Civil Service

Cost:

- 5,000 Science

Effect:

- adds floor(healthy Unemployed Workers / 100) basic resources per manual click.

This gives Unemployed Workers a useful late-game role while percentage controls remain available.

## Omitted Original Technologies

Temporarily excluded because warfare or diplomacy is absent:

- Palisade
- Basic Weaponry
- Basic Shields
- Horseback Riding
- Mathematics as siege-engine unlock
- Battle Standard
- Trade
- Currency
- Commerce
- Nationalism as soldier-based click bonus

These names should remain reserved unless deliberately redesigned later.

## Technology Presentation

The UI should show technologies as a tree grouped into horizontal Age bands.

Recommended behavior:

- current Age is fully visible;
- prior Ages remain visible but collapsed by default;
- future Ages show full costs, exact effects, and prerequisites; purchases remain disabled until unlocked;
- purchasing an Age Advancement technology changes both mechanics and the settlement's visual vocabulary.
