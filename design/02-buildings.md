# Foundations — Buildings

## General Rules

Buildings are purchased from the management UI but automatically placed in the 3D settlement.

Listed costs and effects are Foundations requirements. References to CivClicker are historical context, not fallback rules for unspecified behavior. Missing mechanics are tracked in the [design review](06-design-review.md).

## Housing

| Building | Cost | Effect | Placement |
|---|---:|---:|---|
| Tent | 2 Skins, 2 Wood | +1 max population | Loose clusters near settlement center or camp roads |
| Wooden Hut | 1 Skin, 20 Wood | +3 max population | Residential clusters, generally near existing huts |
| Cottage | 10 Wood, 30 Stone | +6 max population | Residential streets; replaces scattered visual character with village blocks |
| House | 30 Wood, 70 Stone | +10 max population | Denser residential streets and town blocks |
| Mansion | 200 Wood, 200 Stone, 20 Leather | +50 max population | Larger plots near central roads, temples, or prominent areas |

### Housing Upgrades

- **Tenements**: Houses support an additional **+2 population** each.
- **Slums**: Houses support another **+2 population** each.

These bonuses stack, making an upgraded House support 14 population.

## Storage

| Building | Cost | Effect | Placement |
|---|---:|---:|---|
| Barn | 100 Wood | +200 Food storage | Near agricultural edge and roads |
| Wood Stockpile | 100 Wood | +200 Wood storage | Near forest-facing edge or workshop district |
| Stone Stockpile | 100 Wood | +200 Stone storage | Near quarry/mining edge or industrial district |

### Granaries

Granaries is a Technology rather than a separate building.

Effect:

- Each Barn stores **400 Food instead of 200**.

The visual Barn model can upgrade to a granary-like version after the technology is purchased.

## Processing and Service Buildings

| Building | Cost | Effect | Placement |
|---|---:|---:|---|
| Tannery | 30 Wood, 70 Stone, 2 Skins | Allows 1 Tanner | Industrial edge; avoid dense residential core |
| Smithy | 30 Wood, 70 Stone, 2 Ore | Allows 1 Blacksmith | Industrial cluster, preferably near Stone Stockpiles |
| Apothecary | 30 Wood, 70 Stone, 2 Herbs | Allows 1 Apothecary | Near populated residential streets |
| Temple | 30 Wood, 120 Stone, 10 Herbs | Allows 1 Cleric | Central, elevated, or visually prominent location |
| Library | 100 Wood, 100 Stone | Allows 1 Librarian; requires Writing | Civic district |
| Graveyard | 100 Wood, 200 Stone, 50 Herbs | Holds 100 graves | Settlement edge, near Temple if practical |

Note: some later CivClicker forks use 50 Wood for Graveyards. This design uses the stable v1.1 interface value of **100 Wood** for compatibility with the original game target.

## Mill

### Unlock

Requires **The Wheel**.

### Effect

Improves Farmers.

The Mill improves Farmer output without adding job capacity. Farmer Food output is multiplied by (1 + 0.05 × owned Mills).

### Cost Scaling

The Mill is deliberately different from normal flat-cost buildings.

For Mill number `n`, where existing Mills = `m`:

```text
Wood cost  = 100 × (m + 1) × 1.05^m
Stone cost = 100 × (m + 1) × 1.05^m
```

This escalating cost is retained.

### Placement

Mills prefer:

1. agricultural outskirts;
2. open terrain;
3. road access;
4. separation from dense urban blocks.

If future terrain supports rivers, a watermill variant may appear automatically where appropriate without changing the economic effect.

## Religious Altars

Altars appear only after a deity is selected.

Each Altar gives **+1 Devotion**.

### Fields Altar

Base cost:

- 500 Food
- 500 Wood
- 200 Stone
- 200 Piety

For existing Fields Altars m, the next costs 500 × (m + 1) Food and the same Wood; Stone and Piety stay flat.

Placement:

- near farms, fields, or rural shrines

### Underworld Altar

Base cost:

- 200 Stone
- 200 Piety
- 1 Corpse

Placement:

- near Graveyards or settlement edge

### Cat Altar

Base cost:

- 200 Stone
- 200 Piety
- 100 Herbs

Placement:

- near housing, hearth areas, or Temple district

### Battle Altar

The original game includes this altar, but the Battle deity branch is excluded while warfare is excluded.

Keep the underlying data concept available for later expansion.

## Omitted Buildings

The following are not part of the first version:

- Barracks
- Stable
- Fortifications

They should remain reserved for a later warfare module rather than being repurposed.

## Automatic Placement System

### Core Rule

A building purchase creates a **placement request**, not a player-controlled construction cursor.

The settlement generator scores candidate locations.

Example scoring factors:

```text
score = districtPreference
      + roadAccess
      + neighborAffinity
      + terrainSuitability
      - collisionPenalty
      - undesirableNeighborPenalty
```

Exact weights are implementation details and do not affect economic production.

## District Affinity

### Residential

Includes:

- Tents
- Huts
- Cottages
- Houses
- Mansions

Strong attraction to:

- other housing
- roads
- Apothecaries
- Temples

Weak repulsion from:

- Tanneries
- Smithies
- Graveyards

### Agricultural

Includes visual farm plots, Barns, and Mills.

Strong attraction to:

- settlement edge
- open terrain
- existing agricultural buildings

### Industrial

Includes:

- Tanneries
- Smithies
- Wood Stockpiles
- Stone Stockpiles

Strong attraction to:

- roads
- other industrial buildings
- settlement edge

### Civic / Religious

Includes:

- Temples
- Apothecaries
- later civic structures

Preference:

- reachable from residential districts
- central or prominent sites

### Funerary

Includes:

- Graveyards
- Underworld Altars

Preference:

- settlement edge
- near roads
- away from dense housing

## Placement Failure

If no ideal location exists, the game must still place a purchased building.

Priority order:

1. valid terrain and no overlap;
2. road connectivity;
3. district preference;
4. aesthetics.

Never block economic progression because the visual generator cannot find a perfect site.

## Purchases and unlocks

The [implementation rules](07-rules.md#buildings-and-placement) define all unlocks, immediate economic effects, integer price rounding, atomic bulk purchases, and expandable terrain. Start with one Barn and one of each Stockpile; no housing is prebuilt. Masonry can be bought before any Workers, allowing a Cottage to provide the first housing.
