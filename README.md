# Unified Research Tree

One research tab instead of five, laid out so it reads cleanly, plus tidier item categories, consistent names and base-game storytellers only. XML patches only, no code.

## Research tabs
- Moves 61 projects into **Main**: 46 from **Vanilla Expanded**, 13 from **Basics** (VFE Tribals) and 2 from **ReGrowth**. Main then holds 183 projects, including the new Crossbows project.
- Removes the **Vanilla Expanded**, **Basics** and **ReGrowth** tabs. A tab is only removed if no research still uses it, so a mod update that adds new projects there keeps its tab.
- **Anomaly** and **Gravtech** are not touched.

## Research layout
- Every Main project gets a new position: 36 columns wide, 14 rows tall. The whole tree fits the screen height, so you only scroll sideways.
- Tech eras run left to right, from the Basics projects through to Starflight. Each project sits to the right of everything it requires.
- Fire, Electricity, Microelectronics, Multi-analyzer, Fabrication, Advanced fabrication and Starflight basics sit on one horizontal centre line. The rest of the tree branches up and down from them.
- Projects of the same theme (food, power, apparel, weapons and so on) are kept close together. The five starship projects share one column.

## Merged and adjusted research
Costs are unchanged unless stated. Links to the Basics projects only apply when VFE Tribals is active; for non-tribal starts VFE Tribals completes the Basics projects automatically.

| Project | Change |
|---|---|
| **Recurve bow** | Requires Bow from the Basics projects (when VFE Tribals is active). Unlocks the recurve bow and quiver, as in vanilla |
| **Greatbows** (was *greatbow*, 600) | Unlocks the greatbow, longbow and warbow. Requires Recurve bow |
| **Crossbows** (new, 600) | Unlocks the crossbow and arbalest (were under Greatbow). Requires Greatbows |
| **Advanced clothing** (was *work attire*) | Cost 1,000 → **2,000**. Unlocks everything from work attire, casual wear, formal wear and sterile attire: builder's jacket, chef's toque, chef's uniform, fleece shirt, hardhat, jeans, jumpsuit, overalls, baseball cap, casual T-shirt, glasses, hoodie, scarf, shorts, sunglasses, tank top, fedora, shirt and tie, skirt, suit jacket, trousers, doctor scrubs, sterile lab coat, surgical mask |
| **Military clothing** | Now also unlocks the ghillie hood and ghillie suit. Requires Advanced clothing (was work attire + sterile attire) |
| **Eltex gear** | Now also unlocks the eltex cape, mask, dagger, mace and sword. Requires Noble apparel (was Complex clothing) |
| **Cultivation** (Basics) | Now also unlocks the scarecrow |
| **Basic furniture** | Requires Furniture (Basics). Now also unlocks the fueled stove and butcher table (were under Construction) and the fur bed and double fur bed (were under Complex furniture). Chain: Construction > Furniture > Basic furniture > Complex furniture |
| **Complex clothing** | Requires Tribalwear (Basics) |
| **Stonecutting** | Requires Mining (Basics) |
| **Smithing** | Requires Weapons (Basics) |
| **Brewing** | Requires Cultivation (Basics) |
| **Pemmican** | Requires Hunting (Basics) |
| **Drug production** | Requires Medicine (Basics) |
| **Culture** (Basics) | Shows a single line from Furniture. Medicine, Tribalwear, Animal handling and Bow are still required but no longer drawn |
| **Harp** | Requires Culture (Basics) as well as Complex furniture |
| **Leather tanning** | Now also unlocks leather armor and leather helmet (were under Smithing) |
| Heavy leather armor and helmet | Require **Plate armor and Leather tanning** (were Plate armor only) |
| **Wine** | Requires Brewing (had no requirement) |
| **Gunsmithing** | Now also unlocks the trench gun and flamethrower (were under Trench warfare) |
| **Machining** | Now also unlocks razor wire (was under Trench warfare) |
| **Imperial war solutions I / II** | The two Deserters projects that shared the name "imperial war solutions" are numbered |

**Removed** (everything they unlocked is listed above): Farming techniques, Caster gear, Casual wear, Formal wear, Sterile attire, Military camouflage.

## Item categories
These are the groups used by bill menus and by stockpile and outfit filters.

**Apparel** is sorted by body slot:
- **headgear**: worn on the head only
- **torso & legs**: renamed from "misc"; body clothing, including pants and skirts
- **handwear**, **footwear**: new groups, replacing the two duplicate "handwear and footwear" groups from Vanilla Apparel Expanded and Cat's Boots and Gloves
- **utility**: belts and packs, unchanged
- **noble**: renamed from "noble apparel"

**Armor** has the same slots: headgear, torso & legs, shields (moved here from Apparel), handwear and footwear. Armor means everything already marked as armor, plus helmets, boots and gloves from armor sets (plate, flak, recon, marine, riot, vacsuit, power armor) and other items with built-in sharp armor of 50% or more.

**Weapons:**
- **ranged**: renamed from "ranged weapons", sorted by range to match the game's accuracy distances (short 12, medium 25, long 40): short range (up to 18 tiles), medium range (19–32), long range (33+), plus grenades
- **unique weapons**: the same three ranges
- **melee**: renamed from "melee weapons". Persona weapons are unchanged.

**Manufactured**: new groups for components & chips, fuel & gases, materials, brewing and ship parts.
**Foods**: new groups for animal feed and preserved & snacks. Raw fruits (Vanilla Plants Expanded) appear inside raw food in the resources list instead of as a separate top-level entry.
**Misc** (under Items): new groups for seeds, genetics, anomaly, animal parts, cores & tech, intel and waste.

Items keep their existing parent groups (Apparel, Armor, Weapons, Manufactured and so on), so traders, outfits and other mods that rely on those groups work as before. Existing stockpiles keep what they allow.

## Names
All names follow the base game's lowercase style (the game capitalises the first letter on screen).

| Before | After |
|---|---|
| autodoor | autodoors |
| beer brewing | brewing |
| artisan furniture | royal furniture |
| wood-fired generator | fueled generator |
| portable wood-fired generator | portable fueled generator |
| industrial wood-fired generator | industrial fueled generator |
| bench | modular bench |
| counter | modular counter |
| long plant pot | modular plant decoration |
| plant pot | plant decoration |
| old computer | personal computer |
| tilable artificial ecosystem | modular artificial ecosystem |
| tilable hydroponics basin | modular hydroponics basin |
| tilable planter box | modular planter box |
| heater (the standing one) | standing heater |
| wall heater | heater |
| torch lamp | torch |
| wall torch lamp | wall torch |
| dining chair | chair |
| electric butcher | electric butcher table |
| rustic wall | weak wall |
| gene centrifuge | genepack centrifuge |
| xenogerm duplicator | xenogerm replicator |
| lab coat (Vanilla Apparel Expanded) | sterile lab coat |
| floor lamp (Vanilla Furniture Expanded, set into the floor) | recessed floor light |
| shelf (Medieval 2 autofill shelf) | autofill shelf |
| artificial nose (android part and its installed version) | android nose |
| heavy charge blaster (Vanilla Weapons Expanded's portable gun) | charge minigun |
| gravship hull (ReBuild's smooth one) | smooth gravship hull |
| burned wood floor (ReBuild's fine one) | burned fine wood floor |
| agave (the sowable crop) | agave plant |
| Grass (the sowable crop) | cultivated grass |
| candelabra (VFE Empire's electric one) | electric candelabra |
| weapon rack (Vanilla Furniture Expanded) | small weapon rack |
| unique compond bow | unique compound bow |
| ressurector belt | resurrector belt |
| kiwi egg (fert.), on the unfertilized egg | kiwi egg (unfert.) |
| inspiration  draught (double space) | inspiration draught |
| king’s robes, general’s cap | king's robes, general's cap |
| vitals centre | vitals center |
| Sychi cap | sychi cap |
| royalty (VFE Empire menu button) | nobles |
| mechs (menu button) | mechanoids |

**Descriptions rewritten:**
- the History and Nobles menu buttons
- the personal computer
- the unfertilized kiwi egg, which described a fertilized one
- the Stoner and Lush traits
- the three Vanilla Gravship Expanded starting ships

## Storytellers
- Only the base-game storytellers are offered: Cassandra Classic, Phoebe Chillax and Randy Random.
- Hidden from the storyteller choice (new game and mid-game change): Talon Tribal (VFE Tribals), Ariadne Archduchess (VFE Empire), Damocles Deserter (VFE Deserters), Maynard Medieval (VFE Medieval 2), Basilicus Bestower (Vanilla Psycasts Expanded).
- They are hidden, not deleted, so a save that already uses one of them keeps working.

## Requirements and compatibility
- RimWorld 1.6. Load at the **bottom** of the mod list.
- Built around all five DLCs and these mods. All of them are optional; a change only applies when its mod is active:
  - Vanilla Expanded Framework
  - Vanilla Factions Expanded: Tribals, Empire, Deserters, Medieval 2
  - Vanilla Furniture Expanded, plus its Farming, Medical, Power, Production, Security and Spacer modules
  - Vanilla Weapons Expanded, Vanilla Apparel Expanded (and Accessories), Vanilla Armour Expanded
  - Vanilla Psycasts Expanded, Vanilla Plants Expanded, Vanilla Temperature Expanded, Vanilla Traits Expanded
  - Vanilla Races Expanded: Android
  - Vanilla Quests Expanded: Deadlife and Drone Factory
  - Vanilla Gravship Expanded: Chapters 1 and 2
  - ReGrowth 2, ReBuild: Doors and Corners, ReSplice: Core, Cat's Boots and Gloves, Shavius's Vanilla Expanded Patches
- Without some of these mods, the tree has gaps where their projects would be. Research added by other mods keeps its own tab and position, and may overlap if it is in Main.
- Research-screen mods that arrange the tree themselves will override this layout.
- Overlaps with Consistent Text on item and menu names. If both are active, this mod's names win.
- Safe to add to an existing save. A save that already researched one of the removed projects may show a harmless warning on load. In an existing colony, items that moved to a different project (for example casual clothes, now under Advanced clothing) stay locked until that project is researched.
