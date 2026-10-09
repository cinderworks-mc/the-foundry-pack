// createsifter: new sifting lines plus the milling step that feeds them, decided 09-02-2026
// as part of the sifter integration pass (notes/apoth-name-vocab.md's sibling ticket,
// notes/queue.md "0.2.9 sifter adds"). rhino rules: var only, everything stays function
// scoped (see foundry_sessions.js's header on the shared rhino scope - a bare `var`/`const`
// at file top level would leak into every other server_script, so nothing here declares
// outside the ServerEvents.recipes callback).
//
// every recipe below is added with event.custom(...) and a raw json body instead of the
// createsifter/create kubejs DSLs. reason: the exact json shape for every recipe type here
// (createsifter:sifting's "input"/"mesh"/"results" and create:milling's "ingredients"/
// "results") was verified straight from the shipped mod jars (createsifter-1.21.1-2.3.0's
// own data/createsifter/recipe/{sifting,milling}/*.json, and create's ProcessingOutput
// codec for the components-carrying result in 3b below), so event.custom with that exact
// shape is the zero-guesswork path - no risk of getting a DSL method's argument order wrong
// and bricking the whole script reload over a recipe nobody has used yet.
//
// createsifter recipes STACK: multiple recipe files targeting the same input+mesh pair all
// contribute their result lines to one pool (proven by the mod's own compat/ae2_dust_brass.json,
// which adds one extra line to the existing dust+brass_mesh table without touching or
// replacing dust_brass.json). every recipe id below is additive for exactly that reason -
// nothing here removes or replaces a mod-shipped recipe.

ServerEvents.recipes(function (event) {
  // --- 3a: apotheosis gem dust, low chance, off the netherrack->crushed_netherrack chain
  // createsifter already ships milling netherrack into createsifter:crushed_netherrack (its
  // own recipe, still active - not touched here) and a sift table for it on both brass mesh
  // tiers. chose crushed_netherrack over plain gravel for the input: gravel+advanced_brass
  // is already a 9-line table (raw metals, lapis, diamond, emerald, amethyst, xp - see
  // gravel_advanced_brass.json), so a 10th line there gets lost in the noise. crushed_netherrack
  // +advanced_brass is a shorter, mineral-flavored table (gold_nugget/quartz/blaze_powder/
  // netherite_scrap) that a crystal dust drop actually fits and stays visible in.
  event.custom({
    type: 'createsifter:sifting',
    input: { item: 'createsifter:crushed_netherrack' },
    mesh: { count: 1, id: 'createsifter:advanced_brass_mesh' },
    processingTime: 500,
    results: [
      { chance: 0.05, id: 'apotheosis:gem_dust' }
    ]
  }).id('foundry:sifting/gem_dust_from_crushed_netherrack')

  // --- 3b: the ironworks vein gem, ultra-rare, same table as 3a. the gem originally
  // failed apoth's Gem.validateBonus at parse (its mining_speed bonus [tools:
  // breaker+shears] and its drop_transform bonus [breaker] both claimed breaker; one
  // bonus per category, thrown the moment a second claims one) - found by rig-verify
  // 09-02, fixed the same day on patricks call: mining_speed bonus removed outright,
  // drop_transform keeps breaker exclusively. schema facts, verified from the shipped
  // jars, kept because they are not obvious: apoth gems are ONE item (apotheosis:gem)
  // carrying which gem as a data component (Apoth.Components.GEM, persistent
  // holderCodec = a plain resource-location string), and createsifter results are
  // create ProcessingOutputs whose codec accepts an optional "components"
  // DataComponentPatch - so the result below is exactly that shape.
  event.custom({
    type: 'createsifter:sifting',
    input: { item: 'createsifter:crushed_netherrack' },
    mesh: { count: 1, id: 'createsifter:advanced_brass_mesh' },
    processingTime: 500,
    results: [
      { chance: 0.01, id: 'apotheosis:gem', components: { 'apotheosis:gem': 'apotheosis:foundry/ironworks_vein' } }
    ]
  }).id('foundry:sifting/ironworks_vein_from_crushed_netherrack')

  // --- 3c (back half): veridium's match, off the same gravel+advanced_brass_mesh table
  // create-sifting's own gravel_advanced_brass.json already sifts. crimsite->iron and
  // ochrum->gold already land there for free (create:crushed_raw_iron 0.25, create:
  // crushed_raw_gold 0.15), and asurine's lapis match is already there too (lapis_lazuli
  // 0.2) - see the note by the milling recipes below for why. veridium is the one orestone
  // with no existing match (its extruder recipe uses prismarine, not a metal block - see
  // foundry_extruder.js), so this is the only new line the chain actually needs.
  event.custom({
    type: 'createsifter:sifting',
    input: { item: 'minecraft:gravel' },
    mesh: { count: 1, id: 'createsifter:advanced_brass_mesh' },
    processingTime: 500,
    results: [
      { chance: 0.15, id: 'minecraft:prismarine_crystals' }
    ]
  }).id('foundry:sifting/gravel_advanced_brass_veridium_addition')

  // --- 3c (front half): mill the four create orestones the extruder learned in 0.2.8
  // (foundry_extruder.js: create:asurine, create:crimsite, create:ochrum, create:veridium)
  // into gravel, so the loop keeps going instead of dead-ending at a decorative block.
  // orestone -> gravel is a straight, uncontested pick: these are Create's own decorative
  // "ore stone" palette blocks (lang-checked - block.create.asurine etc, no ore/raw-material
  // registration on any of them), and stone-type blocks crushing down toward gravel is
  // Create's own standard chain (see createsifter's crushed_netherrack.json for the same
  // shape: one stone-ish block in, one already-siftable item out, no chance roll on the
  // milling step itself - the chance lives at the sift, same as here).
  //
  // deliberately routed to plain gravel and NOT a dedicated new item: a dedicated "crushed
  // asurine"-type item needs its own registration (texture, lang, model) which is out of
  // scope for a recipe-only script, and every existing siftable item that IS reachable
  // without one (dirt, sand, gravel, soul_sand) is already a shared, generic pool - so this
  // chain rides the existing gravel+advanced_brass_mesh table above rather than opening a
  // new backdoor. yield check: making an orestone in the first place already spends far more
  // of the matching metal than sifting could ever give back (crimsite's own extruder recipe
  // eats a full iron_block, ochrum's eats a full gold_block - foundry_extruder.js's
  // event.remove of the mod's own orestone recipes preserved those inputs), so this chain is
  // a net material sink even before the sift's own moderate/ultra-rare chances - a convenience
  // loop, not an ore printer, per house rule.
  var orestones = ['create:asurine', 'create:crimsite', 'create:ochrum', 'create:veridium']
  for (var i = 0; i < orestones.length; i++) {
    var stone = orestones[i]
    event.custom({
      type: 'create:milling',
      ingredients: [{ item: stone }],
      processing_time: 500,
      results: [{ id: 'minecraft:gravel' }]
    }).id('foundry:milling/' + stone.split(':')[1] + '_to_gravel')
  }
})

// 10-09: lead from the sifter (patrick). create sifter ships raw lead pieces but no sifting recipe drops
// any lead, so lead only came from tfmg's ore. one more line on the existing gravel + advanced brass
// mesh table (copper/zinc sit at 0.2 there), stacked like the lines above. crushed raw lead smelts and
// blasts into tfmg's lead ingot (tfmg's own lead_ingot_from_crushed_blasting recipes), so it is not a dead end.
ServerEvents.recipes(function (event) {
  event.custom({
    type: 'createsifter:sifting',
    input: { item: 'minecraft:gravel' },
    mesh: { count: 1, id: 'createsifter:advanced_brass_mesh' },
    processingTime: 500,
    results: [
      { chance: 0.2, id: 'create:crushed_raw_lead' }
    ]
  }).id('foundry:sifting/crushed_lead_from_gravel')
})

