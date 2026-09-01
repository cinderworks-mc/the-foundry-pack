// cohesion pass 08-26: recipes for the losing half of every true duplicate.
// verdicts + reasoning live in notes/cohesion-08-26.md. the matching jei hides are in
// client_scripts/foundry_cohesion_hide.js. every line says who won.
// quark losers are ALSO switched off at the module level in config/quark-common.toml,
// this is the belt to that suspenders (quark keeps registering the items either way).
ServerEvents.recipes(event => {
  // ---- quark loses to ecologics: azalea wood set (17 names). ecologics also owns the
  // rooted azalea trees in lush caves, quark's "Azalea Wood" module is off in config.
  event.remove({ output: /^quark:(stripped_)?azalea_/ })
  // scoped to output ALSO being quark: 08-28 root-caused a live "can't craft sticks"
  // outage to this line - a bare input: regex matches by TAG MEMBERSHIP, and
  // quark:azalea_planks is itself a member of #minecraft:planks, so this was silently
  // deleting every vanilla recipe that takes the generic planks tag (stick,
  // crafting_table, chest, bookshelf, all 5 wood tools, bowl, beehive, shield,
  // campfire, barrel, composter, tripwire_hook, jukebox, note_block...). adding the
  // output: quark: condition keeps this to quark's own hollow logs/posts/bookshelf/
  // chest/vertical slab recipes, which was always the actual intent.
  event.remove({ output: /^quark:/, input: /^quark:(stripped_)?azalea_/ })

  // ---- quark loses to create: stone pillars (andesite/diorite/granite/calcite/dripstone/tuff).
  // limestone pillar already went with "New Stone Types". quark "Enable Pillar" is off in config.
  event.remove({ output: /^quark:(andesite|diorite|granite|calcite|dripstone|tuff)_pillar$/ })

  // ---- quark loses to create: framed glass + pane (and quark's 16 dyed variants that hang off it).
  // quark "Framed Glass" module is off in config.
  event.remove({ output: /^quark:([a-z_]+_)?framed_glass(_pane)?$/ })

  // ---- quark loses to supplementaries: gold bars, stone lamp (supplementaries' pair with its own
  // door/lamp sets and are what players search for). quark "Gold Bars" module is off in config.
  event.remove({ output: 'quark:gold_bars' })
  event.remove({ output: 'quark:stone_lamp' })

  // ---- quark loses to farmers delight: potato / carrot / beetroot crates (fd uses its crates in
  // its own recipes). quark "Enable * Crate" flags are off in config. uncompress recipes go too.
  event.remove({ output: /^quark:(potato|carrot|beetroot)_crate$/ })
  event.remove({ input: /^quark:(potato|carrot|beetroot)_crate$/ })

  // ---- quark loses to sophisticated backpacks: backpack. quark "Backpack" module is off in config.
  event.remove({ output: 'quark:backpack' })

  // ---- createdeco loses to create: metal bars, doors, industrial iron windows (create 6 ships all of
  // them natively). createdeco's catwalk stairs / railings and locked doors take the createdeco
  // version as an ingredient, so those inputs are rewritten to the create block instead of lost.
  event.remove({ output: /^createdeco:(andesite|brass|copper)_bars$/ })
  // 08-29: scoped the empty {} filter below to input: FROM (plain item id, not a regex) -
  // kubejs.com/wiki/tutorials/recipes confirms { input: '<item id>' } matches recipes whose
  // ingredient is that item, so each replaceInput only walks recipes using its own FROM item
  // instead of the whole registry, same fix shape as the 08-28 output: quark scoping above.
  event.replaceInput({ input: 'createdeco:andesite_bars' }, 'createdeco:andesite_bars', 'create:andesite_bars')
  event.replaceInput({ input: 'createdeco:brass_bars' }, 'createdeco:brass_bars', 'create:brass_bars')
  event.replaceInput({ input: 'createdeco:copper_bars' }, 'createdeco:copper_bars', 'create:copper_bars')
  event.remove({ output: /^createdeco:(andesite|brass)_door$/ })
  event.replaceInput({ input: 'createdeco:andesite_door' }, 'createdeco:andesite_door', 'create:andesite_door')
  event.replaceInput({ input: 'createdeco:brass_door' }, 'createdeco:brass_door', 'create:brass_door')
  event.remove({ output: /^createdeco:industrial_iron_window(_pane)?$/ })
  event.replaceInput({ input: 'createdeco:industrial_iron_window' }, 'createdeco:industrial_iron_window', 'create:industrial_iron_window')

  // ---- createdeco loses to quark: iron ladder (quark is the vanilla+ layer, "Variant Ladders" stays on).
  event.remove({ output: 'createdeco:iron_ladder' })

  // ---- createdeco loses to create vibrant vaults: the 16 dyed shipping containers. vibrant vaults'
  // whole point is one colour family across vaults / containers / packagers / frogports, createdeco's
  // are a leftover from before create 6 had packaging. (the plain createdeco container stays.)
  event.remove({ output: /^createdeco:[a-z_]+_shipping_container$/ })

  // ---- dndecor loses to createdeco: catwalks + sheet metal (createdeco owns metal deco here).
  event.remove({ output: /^dndecor:(andesite|brass|copper|iron|zinc)_catwalk$/ })
  event.remove({ output: /^dndecor:(andesite|brass|copper|iron|zinc)_sheet_metal$/ })

  // ---- bits n bobs loses to interiors: the 16 dyed chairs (interiors is the furniture mod).
  event.remove({ output: /^bits_n_bobs:[a-z_]+_chair$/ })
  // ---- bits n bobs loses to dndecor: brass lamp (dndecor has the lighting set).
  event.remove({ output: 'bits_n_bobs:brass_lamp' })

  // ---- create framed loses to createdeco: brass / copper / zinc windows + panes.
  event.remove({ output: /^createframed:(brass|copper|zinc)_window(_pane)?$/ })

  // ---- create c&a loses to create connected: brass gearbox (+vertical), inverted clutch, inverted
  // gearshift. the "from conversion" recipes take the c&a block as input, so drop those too.
  event.remove({ output: /^create_ca:(vertical_)?brass_gearbox$/ })
  event.remove({ output: /^create_ca:inverted_(clutch|gearshift)$/ })
  event.remove({ input: /^create_ca:((vertical_)?brass_gearbox|inverted_(clutch|gearshift))$/ })
  // ---- create encased loses to create connected: brass gearbox (same block, third copy).
  event.remove({ output: 'createcasing:brass_gearbox' })
  event.remove({ input: 'createcasing:brass_gearbox' })

  // ---- tfmg loses to create encased: brass fluid valve / mechanical pump / smart fluid pipe
  // (cosmetic re-encasings, no tfmg recipe consumes them - checked the jar).
  event.remove({ output: /^tfmg:brass_(fluid_valve|mechanical_pump|smart_fluid_pipe)$/ })

  // ---- create things and misc loses to: tfmg (neon tube), slice and dice (sprinkler),
  // steam n rails (track buffer, id train_stop).
  event.remove({ output: 'create_things_and_misc:neon_tube' })
  event.remove({ output: /^create_things_and_misc:sprinkler(on)?$/ })
  event.remove({ output: 'create_things_and_misc:train_stop' })
})

// patrick 08-26: create stuff 'n additions stays, but its jetpack and flamethrower lose to
// create jetpack and tfmg. recipes off; items hidden client-side in foundry_cohesion_hide.js.
ServerEvents.recipes(event => {
  event.remove({ output: /^create_sa:.*(jetpack|flamethrower).*$/ })
})
