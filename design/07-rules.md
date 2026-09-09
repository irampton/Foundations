# Foundations — Implementation Rules

Status: **Approved baseline**, incorporating the user’s startup, Wonder, and population revisions. Numerical values are initial balance settings, not playtested pacing. This document is the authoritative source for detailed simulation rules; documents 00–05 provide system-specific views. CivClicker is inspiration only. The Wonder roster mixes ancient and modern selections that work as freestanding landmarks.

## Startup and discovery

- Start in Settlement Age with 200 Food, 200 Wood, 200 Stone, and zero of every other resource/state value; no Workers and no technologies.
- Own one Barn, one Wood Stockpile, and one Stone Stockpile for free. Start with no housing buildings and zero population capacity. The three storage buildings supply exactly 200 capacity for each basic resource; there is no extra hidden base storage.
- Skinning costs 10 Wood; Harvesting costs 10 Wood; Prospecting costs 10 Stone. They require only Settlement Age. Manual gathering remains available with zero population.
- Bootstrap: buy Masonry for 100 Wood and 100 Stone, then a Cottage for 10 Wood and 30 Stone. This leaves 90 Wood, 70 Stone, and 200 Food with 6 housing capacity. Create a Worker for 20 Food and buy Skinning for 10 Wood to begin Farmer Skin production. Masonry has no population prerequisite; Tents and Huts become useful once Skins are available.

## Production and storage

Use a one-second logical economic tick with fractional resource balances; never round stored amounts to whole units. Display two decimals below 100 and whole units above that, without changing underlying values. Workers/buildings remain integers. Prices displayed for purchases are exact integers.

| Job | Base output per second | Inputs per second | Capacity |
|---|---:|---:|---|
| Farmer | 0.2 Food | None | Unlimited |
| Woodcutter | 0.2 Wood | None | Unlimited |
| Miner | 0.2 Stone | None | Unlimited |
| Tanner | 0.1 Leather | 0.1 Skins | 1 per Tannery |
| Blacksmith | 0.1 Metal | 0.1 Ore | 1 per Smithy |
| Apothecary | Up to 0.1 healing work | 1 Herb per completed cure | 1 per Apothecary building |
| Cleric | 0.05 Piety, plus up to 0.1 burial work | 1 free grave per completed burial | 1 per Temple |
| Librarian | 0.1 Science | None | 1 per Library |
| Labourer | 1 Wonder work | See Wonders | Unlimited during active project |

- Basic gatherers produce secondary resources only after the relevant discovery: 0.01 Skins/Herbs/Ore per corresponding gatherer per second. Use deterministic fractional accumulation, not a random chance. This deliberately replaces 'occasional' random drops.
- Butchering, Gardening, and Extraction double the corresponding secondary rate. Flensing doubles Skins again; Macerating doubles Ore again. Guilds doubles all three rates again. These bonuses multiply.
- Manual clicks initially yield 1 Food/Wood/Stone. They never yield secondary resources. Gatherer secondary output continues at full basic storage and is independent of Happiness and Mill bonuses.
- Tanners and Blacksmiths process fractional quantities up to available input; no input means no output or input debt. No additional production multipliers apply to processors.
- Food, Wood, and Stone alone have storage caps; other resources, Cats, and Corpses have no gameplay cap. Devotion is an integer count of owned altars. Science and Piety are not interchangeable.
- Farmer rate before multipliers is 0.2 plus 0.1 each from Domestication, Ploughshares, and Irrigation, and 0.2 each from Crop Rotation, Selective Breeding, and Fertilisers.
- Automatic basic production = gatherers × upgraded base rate × Happiness multiplier. Food additionally multiplies by `(1 + 0.05 × Mills)` and the Fields/Cat production effects below. There is no adjacency, walking-time, road, or finite-deposit modifier.
- Cleric output is `Clerics × 0.05 × Writing multiplier × Secrets multiplier`; Writing gives ×2. Clerics produce Piety while also burying. Other jobs have no Happiness modifier.
- Manual clicks receive only the technology bonuses specified below, not Happiness, Mills, religion, or Wonders.
- Apply input consumption and output as specified by the tick order below, then discard basic resources exceeding capacity. No resource balance may become negative.

## Food, health, and Happiness

- Every living Worker, including Sick and Unemployed Workers, consumes 0.1 Food/s. Buy living Workers for 20 Food each only with free housing; they start healthy and Unemployed.
- During a tick, satisfy Food demand from stored Food plus that tick's production before applying the storage cap. Food equal to demand counts as fed, even if the ending balance is zero.
- Any unpaid demand starts a shortage counter. Reset it after one fully fed tick. At 30 consecutive shortage seconds, one living Worker dies; another dies every 10 further shortage seconds. Stop at zero living Workers.
- Select a death or sacrifice victim from Sick Workers first, then Unemployed, then jobs in this fixed order: Labourer, Librarian, Cleric, Apothecary, Blacksmith, Tanner, Miner, Woodcutter, Farmer. Remove that assignment immediately. Death releases housing and creates 1 unburied Corpse, except sacrifices explicitly described otherwise.
- Every 60 simulation seconds, if there is at least one unburied Corpse, each healthy living Worker has probability `min(0.25, Corpses × 0.001)` of becoming Sick. Roll in stable worker-ID order using saved random state. No background sickness occurs without Corpses. Sickness itself does not kill.
- Sick Workers occupy housing and eat, but do not work or count as available workforce. Remove their previous job assignment; cured Workers return to Unemployed before rebalancing.
- Pool Apothecary healing work. Each whole work unit cures 1 Sick Worker and costs 1 Herb. With no Herbs or no Sick Workers, stop generating work; retain only fractional work, never bank completed cures. Cure the oldest Sick worker first, breaking ties by worker ID.
- Pool Cleric burial work. Each whole unit removes 1 unburied Corpse and consumes 1 free grave. No Corpses or no free graves means no burial work accumulation; retain only fractional work. Graves remain occupied permanently. Each Graveyard adds 100 graves. Buried remains cannot fund abilities.
- Happiness is a derived score from 0 to 100, recalculated each tick: `clamp(100 - crowding - sicknessPenalty + templeBonus + catBonus + graceBonus, 0, 100)`.
- `crowding = 50 × max(0, (livingPopulation / housing - 0.8) / 0.2)`; use zero if population or housing is zero. Code of Laws halves this penalty. Sick Workers count as living population.
- `sicknessPenalty = 30 × Sick / livingPopulation`, or zero with no population. Aesthetics adds `min(20, 2 × Temples)`, including existing Temples. Cats add `min(10, 0.1 × Cats)`. Grace adds 10 permanently once bought.
- Happiness production multiplier for basic gatherers, is `0.5 + Happiness / 200`, ranging from ×0.5 to ×1.0. No direct Happiness deaths, rebellion, population cap changes, or other unlisted effects.

## Workforce automation

- Manual counts are protected first. Automatic targets use the remaining healthy living Workers after manual assignments, not total population. Sick Workers are excluded.
- Normalize only automatic targets if their sum exceeds 100. If the sum is below 100, leave the untargeted fraction Unemployed.
- Compute ideal counts, floor them, then allocate the remaining integer slots up to `floor(pool × min(targetSum, 100) / 100)` by largest fractional remainder. Tie-break in the job order Farmer, Woodcutter, Miner, Tanner, Blacksmith, Apothecary, Cleric, Librarian, Labourer.
- Enforce job capacity after rounding; excess stays Unemployed, not redistributed to other jobs.
- Rebalance after every tick and immediately after player assignment, mode, capacity, or target changes. Death and sickness reduce manual counts; do not maintain hidden manual vacancies.
- Switching a job to Manual freezes its current count. Switching it to Automatic starts its target at 0% and releases its manual allocation. Manual plus/minus controls are disabled for an automatic job until switched back.
- Clamp quantity actions to available healthy Unemployed Workers or current job count. Reject negative/fractional custom counts and percentages outside 0–100. `Max` fills available capacity; `-All` releases that job's entire assignment.

## Buildings and placement

- Tent, Wooden Hut, Barn, and both Stockpiles are available in Settlement Age. Masonry unlocks Cottage, Tannery, Smithy, Apothecary, Temple, and Graveyard. Writing unlocks Library. The Wheel unlocks Mill. Construction unlocks House. Architecture unlocks Mansion and Wonders. A selected deity unlocks only its Altar.
- Library costs 100 Wood and 100 Stone and allows 1 Librarian; placement follows civic district rules.
- Use listed building costs otherwise. Buildings take effect immediately on purchase; visual animation or delayed placement never delays capacity. Housing tiers coexist; new housing does not replace old buildings.
- No selling, demolition, relocation controls, or construction-worker requirement in the first release. Housing and storage technologies apply retroactively to all owned eligible buildings and to future purchases.
- Round each individual Mill's Wood/Stone cost up to the next integer using the existing scaling formula. A bulk purchase sums the next individual prices. Custom bulk purchases are all-or-nothing; Max buys the greatest affordable count. All transactions check and deduct costs atomically.
- Fields Altar number `m + 1` costs `500 × (m + 1)` Food, the same Wood, 200 Stone, and 200 Piety. Underworld and Cat altars keep the listed flat costs. All altar counts are integers.
- Terrain expands procedurally when space is insufficient. Forests, quarries, fields, and roads are visual features and never deplete or restrict economic gathering. The world generator must offer valid buildable expansion land.
- Reserve a Wonder site before rendering it. Never destroy existing buildings. If rendering/placement fails, retain economic ownership, queue visual placement, and retry on generated terrain. Represent large building counts with district aggregates; never require one mesh per owned building.
- Camera: orbit, pan, and zoom; a reset-view action; no manual building placement. Visual citizen movement is decorative. A save records the generation seed, layout version, and placed building records so reloading preserves appearance.

## Science and technology

Writing remains a Village technology costing 500 Skins, doubles Cleric Piety, and also unlocks Libraries. Research is an instant, one-time purchase; there is no research queue or ongoing research timer.

The table below replaces resource prices only for the named technologies. Earlier discovery/agriculture/Wheel/Writing prices remain as specified (with the revised discovery costs above). Worship continues to cost 1,000 Piety. Deity selection and abilities continue using their religious costs. Buying Writing does not retroactively change other prices.

| Technology | Replacement cost |
|---|---:|
| Construction | 100 Science |
| Butchering | 40 Science |
| Gardening | 40 Science |
| Extraction | 40 Science |
| Tenements | 100 Science |
| Slums | 200 Science |
| Granaries | 200 Science |
| Code of Laws | 200 Science |
| Administration | 200 Science |
| Architecture | 1,000 Science |
| Flensing | 500 Science |
| Macerating | 500 Science |
| Crop Rotation | 1,000 Science |
| Selective Breeding | 1,000 Science |
| Fertilisers | 1,000 Science |
| Aesthetics | 1,000 Science |
| Civil Service | 2,000 Science |
| Feudalism | 3,000 Science |
| Guilds | 3,000 Science |
| Serfs | 5,000 Science |

- A technology requires its listed Age and every explicit prerequisite. Add Writing as a prerequisite for Construction; every subsequent Science technology then inherits access through Age gates. Keep other existing prerequisites, and add Skinning + Butchering to Flensing and Prospecting + Extraction to Macerating.
- Masonry, Construction, Architecture, and Civil Service advance to Village, Town, City, and Developed City respectively. Advancement does not require every other technology, a population threshold, or extra fees. Earlier unpurchased technologies remain available at their listed prices.
- Mill unlock is Village through The Wheel. Civil Service is bought in City and opens Developed City. These are definitive unlock ages.
- Civil Service adds 1 basic resource per manual click; Feudalism adds another 1. Serfs adds `floor(healthy living Unemployed / 100)` per click. Sick Workers do not contribute. Guilds affects automatic secondary rates only.
- All other missing numeric technology effects are given in Production and Food/Health/Happiness. Existing explicit bonuses such as House capacity and Barn doubling remain unchanged.

## Religion

- Worship costs 1,000 Piety once; choosing a deity costs a separate 500 Piety. Selection is permanent for the current settlement. Deity switching, Iconoclasm, and pantheon history remain deferred.
- Devotion equals the number of owned altars for the selected deity; it is never spent. Thresholds make abilities available; passive abilities with a listed cost must be purchased once. Repeatable actions pay on every use. Disabled/reserved abilities provide no benefit and cannot be purchased.
- Passive religious upgrades persist for the settlement and through save/reload; active timers persist with their remaining duration.

| Ability | Exact effect |
|---|---|
| Blessing of Abundance | Pay 1,000 Piety once at 10 Devotion for ×1.1 automatic Farmer Food output. |
| Burn Wicker Man | At 20 Devotion, pay 500 Wood and sacrifice 1 living Worker. Grant 500 Food, 500 Wood, or 500 Stone with equal probability, using saved random state. Clamp reward to storage; allow overflow loss and show that possibility before activation. The sacrifice creates no Corpse. No cooldown; each use is an explicit player action. |
| Abide No Waste | Pay 1,000 Piety once at 30 Devotion. Before recording a Food shortage, consume `min(Corpses, ceil(unpaidFood / 10))` Corpses; each satisfies up to 10 Food of that tick's demand. Discard unused nutrition; do not add Food to storage. Fully covered demand resets shortage. |
| Walk Behind the Rows | At 40 Devotion, explicit toggle with no activation fee. Sacrifice 1 living Worker at the start of each active tick; that tick's automatic Farmer Food gains ×2. No Corpse from the sacrifice. Automatically turn off instead of sacrificing if only 1 living Worker remains or a Food shortage is already active. Toggle defaults off on load. |
| Book of the Dead | Pay 1,000 Piety once at 10 Devotion; gain 10 Piety per living-worker death, including sacrifices. |
| A Feast for Crows | Pay 1,000 Piety once at 30 Devotion; multiply corpse-driven sickness probability by 0.5 after its cap. |
| Secrets of the Tombs | Pay 5,000 Piety once at 50 Devotion; Cleric Piety multiplier becomes `1 + 0.05 × Graveyards`, regardless of occupied graves. |
| Lure of Civilisation | Pay 1,000 Piety once at 10 Devotion; increase per-new-living-Worker Cat chance from 1% to 2%. |
| Pest Control | At 20 Devotion, pay 100 Piety for ×1.5 automatic Farmer Food for 60 simulation seconds. Cannot reactivate while active; no stacking or extension. |
| Warmth of the Companion | Pay 1,000 Piety once at 30 Devotion. Cats contribute `Cats × 0.01` healing work/s to a separate pool with no Herb cost. One whole work unit cures one Sick Worker; no banking completed cures while no one is Sick. |
| Grace | Pay 1,000 Piety once at 40 Devotion for +10 Happiness. |

- Each successfully purchased living Worker independently rolls once for a Cat, even before religion unlocks. One success adds 1 Cat. Bulk purchases perform one roll per Worker. Cats have no upkeep or natural death. Base Happiness benefits apply without selecting Cats.
- Fields 50, Underworld 20 and 40, Cats 50, and the whole Battle branch remain inactive as already specified. List them as future content only in explanatory help, not actionable buttons.

## Wonders

- Allow one active project at a time and any number of completed Wonders. Starting costs nothing, requires Architecture, and enables Labourers. There is no Labourer building cap.
- Every Wonder requires 100,000 work units. Each work unit consumes exactly 1 Wood, 1 Stone, 0.1 Leather, and 0.1 Metal. Total cost: 100,000 Wood, 100,000 Stone, 10,000 Leather, 10,000 Metal.
- Per tick, work completed is `min(Labourers, remainingWork, Wood, Stone, Leather / 0.1, Metal / 0.1)`. Deduct corresponding resources atomically. Partial work is allowed; zero of any required resource means zero work. No Food/Piety/Science/Gold construction cost and no escalation across Wonders.
- Labourers remain assigned during shortages. Players pause by unassigning Labourers. No cancellation, refunds, or archetype change after starting in the first release.
- On completion, release Labourers to Unemployed, set its automatic job target to 0%, and disable that job until another Wonder starts. Mark the Wonder complete immediately; another project may start without a reward-selection step.
- Wonders grant no bonuses of any kind: no production modifiers, Happiness, resource rewards, technology unlocks, or cross-save rewards. Completion is a visual milestone only.
- Provide exactly seven distinct Wonder types, modeled after the mixed ancient/modern roster below. All seven types unlock with Architecture and use the same construction costs and rules. Players select the type before construction; repeat builds are allowed, preserving the unlimited completed-project rule. Progress stages begin at 0%, 5%, 20%, 40%, 60%, 85%, and 100%. Religion may add cosmetic motifs while preserving each type’s recognizable form.
- Save name, type ID, completion state, completion order, civilization name, and model ID. Default civilization name is Foundations Settlement; default Wonder names are Wonder 1, Wonder 2, etc. Names may be changed to trimmed nonempty plain text of at most 60 Unicode code points; names never determine mechanics.

| Type ID | Wonder model | Visual direction |
|---|---|---|
| great_pyramid | Great Pyramid of Giza | Freestanding stone pyramid with a square footprint |
| hanging_gardens | Hanging Gardens of Babylon | Stylized freestanding terraces with dense greenery and cascading water |
| lighthouse | Lighthouse of Alexandria | Tall tiered tower with a beacon; does not require a coastline |
| colossus | Colossus of Rhodes | Monumental standing bronze figure on a pedestal; does not require a harbor |
| mausoleum | Mausoleum at Halicarnassus | Raised monumental tomb, colonnade, and stepped roof |
| taj_mahal | Taj Mahal | Domed central mausoleum and four minarets within one reserved site |
| el_castillo | El Castillo at Chichén Itzá | Stepped pyramid with broad stairways and a summit temple |

These are recognizable stylized models, not archaeological reconstructions. Each is self-contained on a reserved site. Petra and terrain-dependent wall structures are excluded.

## Simulation, saving, and offline policy

Tick order: apply queued player transactions in order; process Walk sacrifices; rebalance jobs; calculate production/conversions and Food demand; use Abide No Waste and process starvation; run scheduled sickness rolls; process Apothecary then Cat cures; process Cleric burials; process Wonder work/completion; cap basic stores; decrement active timers; recalculate Happiness and rebalance for the next tick. Production uses Happiness and active bonuses at tick start. Newly Sick Workers lose productivity starting the next tick. Newly cured Workers work starting the next tick.

Persist a versioned save containing all resources, buildings, occupied graves, technology purchases, worker states/IDs, assignments/modes/targets, Cats, deity/abilities/timers, fractional healing/burial work, shortage counters, simulation time, random generator state, Wonder records, map records/seed, settings, and last-save timestamp. On load, recalculate derived caps/bonuses from source state rather than granting them twice.

Saving: autosave every 30 seconds and after purchases, deity choices and Wonder starts/completions, and explicit Save. Keep the previous valid snapshot as backup. Provide manual save export/import with schema validation and a visible saved/failed status; do not silently overwrite a valid save with invalid imported data. No accounts, cloud synchronization, or multiplayer in the first release.

**Confirmed:** no offline production. No elapsed-time catch-up, resource grants, or deaths after closing the game. **Browser behavior:** also pause all simulation while the page is hidden, the start screen is open, or explicit Pause is active; resuming starts from the saved simulation time without catch-up. Active ability timers, sickness, and shortage counters pause with simulation. A visible pause indicator explains the state.

**Confirmed:** include a start screen and save/load, with no prestige/restart rewards or cross-save bonus unlocks. **Save flow:** the start screen offers Continue (latest valid save), New Game, Load Game, and Settings. Provide three independent named local save slots and JSON export/import. New Game chooses an empty slot or confirms overwriting an occupied slot, offering export first; loading another slot never merges progress. Pause on the start screen. Save automatically before returning there; if saving fails, keep the current session and report the failure. Do not assume browser-close saving always succeeds; periodic saves and export remain available.

The first release has no hard victory lockout. The first completed Wonder is a milestone; players may continue building. Wonders grant no bonuses within or between saves.

## Presentation and delivery

- Display current inventory/capacity, gross production, consumption, and net rate separately. Show locked-job requirements, capacity, population/housing, Sick counts, Happiness breakdown, and active shortages/timers.
- Show full costs, exact effects, and prerequisites for all technologies from the beginning. Group by Age, collapse previous Ages by default, and disable unaffordable/locked purchases with a specific reason. This replaces the undefined 'Age gate is near' reveal condition.
- Provide keyboard-operable management controls, visible focus, labels for icon actions, sufficient text contrast, tooltips available without hover, reduced-motion mode, and pause/save access. Audio has independent mute/volume controls if included.
- Art scope: five Age appearances, the listed economic buildings plus Library, representative citizens/Cats, automatic roads/districts, seven Wonder types, each with seven construction stages, and deity decoration. Mesh counts are bounded independently of economic population; quality settings control visual density.
- **Confirmed platform:** desktop browsers using Three.js. Initial support is current desktop Chrome, Edge, and Firefox on Windows and macOS with mouse/keyboard; touch and mobile are deferred. Before implementation, agree a reference device, measurable frame-rate/load/save targets, and supported maximum benchmark population/building counts. These are not silently inferred from the design.
- First-release acceptance requires the documented systems to work together from a fresh save through all five Ages and a completed Wonder, with save/reload, recovery from population collapse, all three deity paths tested in separate saves, and no accessible warfare/trade/Gold actions.

## Remaining delivery decisions

Reference hardware and measurable performance targets remain to be agreed before implementation. The remaining rules above are approved as the initial baseline.
