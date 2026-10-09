# the foundry - changelog

what changed in the pack, newest first. house format (notes/changelog-style.md):
one `##` heading per version, `###` category sections inside it (added mods /
removed mods / added features / removed features / config changes / heads up,
only the non-empty ones), one bullet per line, no wrapping. the download page's
3-line summary is the first added mods / added features bullets. entries older
than 0.2.8 predate the format and stay as written.

## 1.0.5 (10-09-2026)

### config changes
- modded trees can be planted in Botany Pots: Thaumaturge greatwood and silverwood, Goety, Ice and Fire dreadwood, Ghosts, Witchery and Tropicraft (palm, mahogany, fruit trees, mangroves). they grow logs, sometimes the sapling back, leaves with shears, and fruit or nuts on the fruit trees

## 1.0.4 (10-09-2026)

### added features
- new players get a tome that already holds every mod's guide book, instead of a pile of loose books. everyone gets it once, and /foundrybook hands out another if you lose it

### config changes
- sifting gravel with an advanced brass mesh can now drop crushed raw lead, at the same odds as copper and zinc

## 1.0.3 (10-09-2026)

### config changes
- fixed items that were wrongly merged into other items: Goety's magic emerald, Oritech's biosteel, Thaumaturge's alchemical brass, Excessive Utilities' colored lapis blocks and EnderIO's infinity bimetal gear are their own items again, so Goety's first gate, biosteel and alchemical brass work
- ores from the Deeper Darker and the Undergarden no longer turn into vanilla ores when mined with silk touch
- silver and platinum from different mods now merge into one version each, and coal, charcoal, quartz, ender pearl dust and saltpeter dust do too
- the Foundry Breach Pearl recipe loads again, so it can be crafted
- the Twilight Forest uncrafting table no longer swaps ingredients
- tamed Ice and Fire dragons no longer destroy blocks

## 1.0.2 (10-09-2026)

### config changes
- loot unification is on: copper, iron and the other shared metals drop as one version of each item, so you stop collecting four different copper nuggets

### removed mods
- Mekanism TFMG Compat: it rewrote Mekanism's recipes to run on TFMG steel and lead. Mekanism and TFMG each keep their own recipes again
- Create: CC Better Recipes: it replaced about 20 CC: Tweaked recipes (computers, monitors, cables) with Create parts. CC: Tweaked keeps its own recipes again
- Create Cybernetics and Cybernetics Vanity: the implant mod and its cyberspace dimension are gone

## 1.0.1 (10-08-2026)

### added mods
- Pipez: item, fluid, energy and gas pipes you can upgrade and filter, a simple alternative to conduits
- Mekanism Pipez Fix: stops Pipez pipes from disconnecting from Mekanism multiblocks
- FTB Ultimine: vein mining with an outline preview, replaces Veinminer. curseforge only, install it from the title screen prompt or the extras page

### added features
- report a problem or an idea from chat: type !log <what went wrong> or !idea <your idea>. it records where you are and what you were looking at

### updated mods
- routine bumps across the pack: ModernFix, Entity Culling, Fusion, Ambient Sounds, Puzzles Lib, AzureLib, Starcatcher, Chat Animation, Spice of Life Onion, Ace's Spell Utils, SuperMartijn642's Core Lib, Kotlin for Forge, Create Additions, Create Enchantment Industry and Ars Delight
- Sophisticated Backpacks, Storage and Core, with their Create integrations
- Just Another Witchery Remake 0.5.13.2
- Astral Sorcery moves to build 2.0.1.35, install it from the extras prompt
- NeoForge 21.1.252, which Quark 4.1-487 needs
- Foundry Additions 0.2.3

### removed mods
- Veinminer, Veinminer Client and Veinminer Enchantment: replaced by FTB Ultimine
- the RPG series: Archers, Arsenal, Jewelry, Paladins & Priests, Rogues & Warriors, Wizards, Runes, Spell Engine, Spell Power, Ranged Weapon API, Shield API and Relics RPG

### heads up
- the launcher will ask to update NeoForge when you update the pack, say yes
- the RPG series items are gone, including any you were carrying or had stored. the two RPG curio slots (spell quiver and spell trinket) are gone too
- items with the Veinminer enchantment lose it. FTB Ultimine is not an enchantment, hold the grave key (the ` key) to use it

## 1.0.0 (10-08-2026)

### added mods
- Draconic Evolution: endgame tech, with its Brandon's Core and CodeChicken Lib libraries and a Sodium rendering fix
- Mekanism: machines, ore processing, energy and jetpacks
- Ice and Fire: dragons, dragon gear and mythic creatures
- Cooking for Blockheads: a kitchen multiblock that shows everything you can cook from the ingredients nearby
- FTB Teams and FTB Library: teams and parties are back. install both from the title screen prompt or the extras page (cinderworks.dev/foundry/pack/extras/)
- Just Another Witchery Remake: the old witchcraft mod rebuilt, with cauldron brewing, rituals and a witch's guide book
- Modonomicon: the guide book library Witchery needs
- The Twilight Forest: the classic dimension, now on the server. install it from the title screen prompt or the extras page (cinderworks.dev/foundry/pack/extras/)
- Tropicraft: a tropical island getaway with its own dimension, plants and mobs
- Occultism: summon spirits that mine, craft and sort for you, with pentacle rituals and familiars
- JAWR: Forbidden Magic: the soul magic and lichdom half of Witchery
- Neo Vitae: blood magic, rebuilt for 1.21.1
- Enhanced Celestials 2: blood moons and harvest moons, rebuilt, with shader support for iris
- Thaumaturge: a research journal, aura and vis magic, and the Crimson Cult. in as an extra for now, the install prompt grabs it
- Integrated Dungeons and Structures: big detailed dungeons with loot that speaks create, quark and supplementaries
- Create: Structures Arise: create-themed structures to find out in the world
- Deeper and Darker: a whole dimension past the ancient city, with warden-tier gear
- Mowzie's Mobs: hand-animated bosses and mobs that sit between early game and cataclysm
- Create: Garnished: nuts and foods your factory makes
- Brewin' and Chewin': kegs for fermenting drinks, cheese and jams
- Waystones: Sable: waystones that work on airships
- Jade Addons: more info in the jade tooltip for create and friends
- Jade Sable Compat: jade lookups work on airship blocks
- JEED: every potion effect explains itself in jei
- Ender IO: conduits and machines (beta)
- Mystical Agriculture: grow your resources as crops
- libraries: SmartBrainLib, CorgiLib, Data Anchor and Cucumber
- The Undergarden: a strange dimension deep underground (beta)
- Aquamirae: ship graveyards and deep sea bosses for the ocean
- Goety: necromancy, soul rituals and illager bosses
- Goety Cataclysm: ties Goety into cataclysm's bosses
- Handcrafted: furniture you can actually sit and sleep on
- Amendments: supplementaries' sister mod, with wall lanterns, better lecterns and cauldron mixing
- Little Joys: dig spots, fishing spots and fallen stars to stumble on
- Etched: burn your own music discs
- Sophisticated Storage Create Integration: sophisticated storage works on contraptions, like the backpacks already do
- Create Stuff 'N Additions x Sable compat: fixes grapplin and floating block crashes on airships
- Create: Compatible Storage: quark and other modded chests work on contraptions
- Create: Extra Gauges: logic gauges for the factory gauge network
- Industrial Foregoing: mob and plant automation machines
- libraries: Fragmentum and Create: Deployer API
- Mystical Customization: lets us tune which mystical agriculture crops exist
- Mystical Agradditions: tier 6 crops, paxels and nether star, dragon egg and draconium crops
- Botany Pots Mystical Agriculture Compat: mystical agriculture seeds grow in botany pots
- Mekanism Generators: solar, wind, gas, fission and fusion power for mekanism
- Mekanism Tools: paxels and armor in mekanism's metals
- Mekanism Additions: balloons, glow panels and plastic blocks
- Mekanism TFMG Compat: mekanism builds on tfmg steel instead of making its own
- Mekanism Ponders: ponder scenes for mekanism's multiblocks
- Just Enough Mekanism Multiblocks: multiblock cost pages in jei
- Create Aeronautics Mekanism Compat: mekanism teleporters, pipes and the digital miner work on airships
- Applied Mekanistics: mekanism chemicals in ae2 storage and patterns
- Ars Mekanica: a source dynamo that turns ars source into power
- Create Propulsion: thrusters and propellers built for airships
- Create Aeroworks: gyroscopes, joysticks and real flight controls for airships
- Gadgets & Gizmos: more thrusters and contraption controls for aeronautics
- Moog's Soaring Structures: floating islands with loot, something to fly your airship to
- Ars Ocultas: ties ars nouveau and occultism together
- Powah: power generators, energy cells and wireless charging for your gear
- Hostile Neural Networks: train data models on mobs, then simulate them for their drops
- Akashic Tome: one book that holds every guide book in the pack
- Sophisticated Item Actions: find and restock items from the storage around you
- Super Factory Manager: script your item and fluid logistics
- The Aether: the classic sky dimension
- Oritech: animated machines, lasers and mechs
- libraries: Moog's Structure Lib, Jupiter, Uranus and owo-lib (beta)
- Building Gadgets 2: direwolf20's building wands for copying, pasting and swapping big areas. curseforge only, install it from the title screen prompt or the extras page (cinderworks.dev/foundry/pack/extras/)
- Mining Gadgets: a mining laser with upgrades. curseforge only, install it from the title screen prompt or the extras page
- Charging Gadgets: a charging station that burns fuel to charge your gear. curseforge only, install it from the title screen prompt or the extras page
- LaserIO: move items, fluids and energy around with lasers. curseforge only, install it from the title screen prompt or the extras page
- Just Dire Things: direwolf20's automation blocks, tools and tiered gear. curseforge only, install it from the title screen prompt or the extras page
- Ars Elemental: elemental schools, foci and familiars for ars nouveau. curseforge only, install it from the title screen prompt or the extras page
- Ars Technica: ars nouveau meets create, with new glyphs, tools and an armor set. curseforge only, install it from the title screen prompt or the extras page
- Starbunclemania: new starbuncle jobs and liquid source for ars nouveau. curseforge only, install it from the title screen prompt or the extras page
- Flux Networks: wireless power across dimensions. curseforge only, install it from the title screen prompt or the extras page
- Mob Grinding Utils: mob farm blocks like fans, the saw and xp tanks. curseforge only, install it from the title screen prompt or the extras page
- Ender Storage: color-coded ender chests and tanks you can share with friends
- Excessive Utilities: the extra utilities classics, remade
- Item Collectors: blocks that vacuum up dropped items nearby
- Pylons: pylons that hand out potion effects, push mobs away or harvest crops
- Time in a Bottle: speed up any machine or crop for a while
- libraries: Aaron

### updated mods
- Foundry Additions 0.2.2: the extras screen is a scrolling list now, with download all and install all buttons
- Astral Sorcery moves to build 2.0.1.33, install it from the extras prompt

### config changes
- Akashic Tome only takes guide books now, spell books and scrolls stay out of it

### heads up
- the world was reset for this update. the Nether, the End and everything outside the old base region regenerate with the new mods
- Thaumaturge is a test build shared by its author, it installs from the extras prompt

## 0.2.13 (10-07-2026)

### updated mods
- Entity Texture Features pinned back to 7.1 so it matches Entity Model Features 3.2.4

### heads up
- 0.2.12 crashed the game as soon as your hand rendered, so it was pulled. if you installed it, update to 0.2.13

## 0.2.12 (10-07-2026)

### added mods
- Foundry Additions 0.2.1: a title screen prompt that walks you through the extra mods we can't ship in the pack
- Cybernetics: install cybernetic parts in your body
- Cybernetics: Vanity: control how your installed cybernetics look
- Astral Sorcery + ObserverLib: now on the server. install them from the title screen prompt or the extras page (cinderworks.dev/foundry/pack/extras/), straight from the mod author's own download server

### updated mods
- Entity Model Features pinned back to 3.2.4 so the Fresh Animations player addon loads again

## 0.2.11 (10-05-2026)

### added mods
- Botany Pots: pots that grow crops for you
- Botany Trees: grow trees in small pots, works with Botany Pots
- Dark Paintings: a batch of new paintings
- Farmer's Spell 'n Spell Book: magical cooking recipes and the School of Gluttony, a crossover of Iron's Spells 'n Spellbooks and Farmer's Delight
- Tempad: open a portal to anywhere from anywhere
- ComputerCraft Create (resource pack): computercraft textures that fit in with create
- Create: Applied Energistics 2 (resource pack): applied energistics in the style of create
- Create Style Sophisticated Storages (resource pack): sophisticated storage, creatified
- Create Style Sophisticated Backpacks (resource pack): sophisticated backpacks, creatified
- Tom's Create Storage (resource pack): tom's simple storage in the create style

## 0.2.10 (10-05-2026)

### updated mods
- routine bumps across the pack: Applied Energistics 2, Ars Nouveau and its Flavors & Delight, the RPG Series (Archers, Jewelry, Paladins & Priests, Rogues & Warriors, Wizards) with Spell Engine, Create and six of its addons, Quark, Supplementaries, Waystones, Lootr, Sable, Eternal Starlight, The Bumblezone, Xaero's Minimap and World Map, and about 35 libraries
- Distant Horizons 3.3.3, Complementary Shaders (Reimagined and Unbound) r5.9.3, Essential 1.5.0.1, Entity Culling 1.11.2, ImmediatelyFast 1.6.14, Sodium Extra 0.9.4

### config changes
- back slots: curios gives you 4 now (was 2)

## 0.2.9 (09-14-2026)

### added mods
- emi, observable, gateways to eternity; 34 mod bumps rode along

### added features
- apotheosis 8.8: foundry invaders (draugr, ironclad), the Line Conductor elite, ironworks gear, breach + frontier gateways, Case Hardened enchant
- patchouli field manual (workshop / expeditions / magic), handed to you on first join alongside the welcome book

### config changes
- mechanical extruder: dropped the height (Y) restrictions on stone recipes, and the overworld netherrack recipe no longer eats its lava
- misc config + presence fixes

## 0.2.8 (09-04-2026)

### added mods
- tom's storage: a simple, high-capacity storage network. terminal blocks read your chests directly, no cables or channels to place.
- create contraption terminals: put a tom's storage terminal on a moving create contraption and it keeps working.
- functional storage: cheap, tiered storage drawers and crates for stacking bulk items.
- findme: search for an item across the chests near you and the matches get highlighted. no new blocks.
- emojiful: type an emoji shortcode in chat, like :ok_hand:, and it renders as an emoji.
- perception: immersive visual effects, screen shake and particle trails and hit feel. client side only.
- trashslot: a trash slot in every inventory screen. drag junk onto it, press t to hide it.
- minemath: a calculator window in game, client side, find it in the controls if you want a key for it.
- reliquified-artifacts: relics built out of artifacts items, so you keep one curios pile instead of two.
- ars-energistique: ars nouveau source can flow into an ae2 system now, a source jar or relay into a network line.
- advanced peripherals: cc:tweaked computers get more peripherals to read and write. the ae2 bridge peripheral is off, it crashed the server on test, everything else works.
- toms peripherals: more cc:tweaked peripherals, printers and databases among them.
- cc-redstone-link-bridge: cc:tweaked computers can read and write create's redstone link channels now.
- ae2 import export card: filter items and fluids in and out of your ae2 system by pattern instead of wiring up one interface per item.
- me requester: pull items and fluids out of an ae2 system straight into your inventory or an ender chest.
- apothic tooltip cleanup: apotheosis affix and gem tooltips are one line each instead of a wall of text. client side, toggle it back in the mod's own config if you liked the old look.
- create integrated farming: create can plant and harvest crops now, contraption pieces included.
- cataclysm tools and cataclysm weaponery: full tool and weapon sets out of the boss materials, cursium and ignitium.

### updated mods
- routine bumps swept in: create-bits-n-bobs, waystones, modernfix, azimuth-api, fusion, spell engine, lambdynamiclights, reconnectible chains, me requester - all bugfix or translation releases.

### added features
- /calc does stack math in chat, /parked tells you who is around and who is parked, /bosses reads the server's boss ledger.
- new apotheosis content: the Foundry Draugr and Ironclad invaders, The Line Conductor elite, the Foundry Line Sentinel gateway, a lineworker spawner, the Cinder Pick trade, the Case Hardened enchant, and the Ironworks Vein gem.
- apotheosis affixes now reach ars nouveau's enchanter's sword, bow, crossbow and shield, and create's cardboard sword.
- generated names picked up foundry words: create, ae2 and ars gear roll material-flavored prefixes, and bosses can come out Rotation-Forged or titled The Line Foreman.
- the mechanical extruder learned rich soil, sky stone, gem dust and the four create orestones. the old orestone recipes are gone.
- the sifter learned new tricks: apoth gem dust off crushed netherrack at low odds, a whole Ironworks Vein gem at very low odds, and the extruder's orestones mill into gravel and sift onward, worse odds than mining the real thing.

### config changes
- apotheosis feels less grindy: augmenting costs less xp, enchantments explain themselves in tooltips, boss alerts reach farther and rogue spawners more often have valuable chests.
- iron's spells bosses roll less often against the rest of the apotheosis invader pool.
- veinminer only chains matching blocks now, not everything in a group. obsidian joins the list.
- distant horizons now starts off. it was eating frames on weaker pcs. options, distant horizons, enable rendering turns it back on.
- budding amethyst drops to a black-steel pickaxe.

### heads up
- re-import the pack.
- the foundry's address is modded.cinderworks.dev now. the welcome book, tab list and voice chat all point at it, and modded.hartforge.dev keeps working.

## 0.2.7 (08-30-2026)

- two of the 0.2.6 addons pulled back out. reliquified cataclysm was built against an older relics api and cinematic cataclysm needs a library it never declares. both crashed the server on load, so neither ever went live.
- what stays from 0.2.6: the spellbook weapons on better combat, and apotheosis affixes on cataclysm gear.
- re-import the pack. a 0.2.6 import has the two extra mods and will not be able to join.

## 0.2.6 (08-30-2026)

- four cataclysm addons, all of them things the bosses should have been doing already.
- cinematic cataclysm: scylla, maledictus, leviathan, ancient remnant and ignis get a one time intro cutscene when you walk into their dungeon. you cannot be hit while it plays.
- reliquified cataclysm: new relics built around those same bosses, so the fights drop something for the relics side of the pack instead of nothing.
- cataclysm spellbooks x better combat: the spellbook weapons now swing on better combat's system with proper reach and attack types, instead of dropping back to the vanilla swing.
- apothic category compat: apotheosis can finally roll affixes and gem sockets on cataclysm, forbidden arcanus and twilight forest gear. those items had no loot category, so they rolled nothing at all before.
- re-import the pack to pick these up.

## 0.2.5 (08-30-2026)

- policy change in the build: a mod flagged "client unsupported" on modrinth still ships to clients unless we pin it server-only on purpose. ai-improvements and alternate-current come along. nothing to do on your side beyond re-importing.

## 0.2.4 (08-30-2026)

- baguettelib now ships to clients. it was marked server only, but it opens a network channel the client has to answer, so joins failed with "channel missing on the client side".

## 0.2.3 - 08-30-2026

- the tab menu is the foundry's now. hold tab and you get a header, a footer, your rank tag on every row, everyone's playtime slot and ping, and the server tps.
- it matches the hearth's tab menu line for line, the same mod on both servers, so the two finally look like they belong to the same place.
- the server list entry the pack pre-adds moved. it used to overwrite your whole multiplayer list on every update, so if you had added other servers they vanished. now it only fills in on a fresh install and leaves your list alone.
- server side only. re-import if you want the servers.dat fix, otherwise nothing here needs you to do anything.

## 0.2.2 - 08-30-2026

- new icon. the foundry has a blast furnace now, drawn to match the hearth's campfire, and it shows up in the server list, on the multiplayer entry the pack pre-adds for you, and on the modrinth page.
- client only, nothing else changed. no new mods, no config changes, no server restart. re-import whenever you feel like it.

## 0.2.1 - 08-30-2026

- six fresh animations addon packs: details, objects, emissive, spiders, creepers and quivers. mobs get extra model details, texture variants, emissive eyes, redone spiders and creepers, and quivers on skeletons.
- these replace the old all-in-one FA extensions pack, which was the same six bundled together but older. nothing is lost and every one of them is now newer.
- client only. nothing changed on the server, so you do not have to do anything if you would rather not re-import.
- fresh animations itself stays on 1.10.4. the newer 1.10.5 is built for a later minecraft and does not list 1.21.1.

## 0.2.0 - 08-30-2026

- ftb is gone. ftb-essentials, ftb-chunks, ftb-teams and ftb-library are all out of the pack.
- essentialcommands and leafrtp take over from ftb-essentials, flan takes over claiming from ftb-chunks. xaero's was already doing the map and create-power-loader was already doing force loading.
- you have to set your home again. the homes ftb held did not carry over, so run /sethome once after you log in and /home works like it did before.
- 18 new mods out of the 1.10 pass, including cataclysm, exposure, comforts and the mechanical extruder.
- the pack bundles no jars at all now. everything in it comes from modrinth's own cdn.

## 0.1.37 - 08-29-2026

- session logging. the server records who was on and when, in-process, for the playtime page later on.
- nothing else changed. no new mods, no config changes, nothing you need to re-import for.
