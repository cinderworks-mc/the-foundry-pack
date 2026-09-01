# the foundry - changelog

what changed in the pack, newest first. one `##` heading per version, and every
non-blank line under it is one bullet on the download page - so keep a bullet on
a single line, no wrapping and no markdown, the page escapes it verbatim.

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
