# the foundry - changelog

what changed in the pack, newest first. house format (notes/changelog-style.md):
one `##` heading per version, `###` category sections inside it (added mods /
removed mods / added features / removed features / config changes / heads up,
only the non-empty ones), one bullet per line, no wrapping. the download page's
3-line summary is the first added mods / added features bullets. entries older
than 0.2.8 predate the format and stay as written.

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
