// recipes for items whose quark module is turned off in config/quark-common.toml.
// quark still registers the items, so without this they stay craftable.

// ---- audit item 3.6, 08-30-2026: byte-identical cross-namespace dupes ----
// every id below was proven to share type + ingredients + result with a recipe
// that STAYS, so removing it cannot make anything uncraftable - it only stops
// jei showing the same recipe twice.
//
// WHY EXPLICIT IDS AND NOT THE REGEX THE AUDIT PLAN CALLED FOR: the proposed
// /^bits_n_bobs:.*_from_stone_types_.*_stonecutting$/ matches SEVENTY recipes
// on this pack, not the 14 real duplicates. the other 56 are bits_n_bobs's own
// tile blocks (_tiles, _tile_slab, _tile_stairs, _tile_wall), which create
// ships no equivalent of - that regex would have quietly deleted 56 working
// stonecutter recipes. a list cannot over-match. the cost is that a future
// bits_n_bobs stone type needs a line here, which is the right trade against
// silently removing real content.
//
// declared above the handler on purpose: a const referenced from a callback
// that runs later is fine, but this file is read by people, not just rhino.
const DUPLICATE_RECIPE_IDS = [
  // 14 verbatim copies of create's stonecutting recipes, same file names under
  // a different namespace. create's copy is the one that stays.
  'bits_n_bobs:andesite_from_stone_types_andesite_stonecutting',
  'bits_n_bobs:asurine_from_stone_types_asurine_stonecutting',
  'bits_n_bobs:calcite_from_stone_types_calcite_stonecutting',
  'bits_n_bobs:crimsite_from_stone_types_crimsite_stonecutting',
  'bits_n_bobs:deepslate_from_stone_types_deepslate_stonecutting',
  'bits_n_bobs:diorite_from_stone_types_diorite_stonecutting',
  'bits_n_bobs:dripstone_block_from_stone_types_dripstone_stonecutting',
  'bits_n_bobs:granite_from_stone_types_granite_stonecutting',
  'bits_n_bobs:limestone_from_stone_types_limestone_stonecutting',
  'bits_n_bobs:ochrum_from_stone_types_ochrum_stonecutting',
  'bits_n_bobs:scorchia_from_stone_types_scorchia_stonecutting',
  'bits_n_bobs:scoria_from_stone_types_scoria_stonecutting',
  'bits_n_bobs:tuff_from_stone_types_tuff_stonecutting',
  'bits_n_bobs:veridium_from_stone_types_veridium_stonecutting',

  // createframed re-declares create's OWN bound cardboard block twice, once
  // shapeless and once as an item application, both with create's exact
  // ingredients (create:cardboard_block + #c:strings -> create:bound_cardboard_block).
  // create:crafting/materials/bound_cardboard_block and
  // create:item_application/bound_cardboard_inworld both stay, so both routes
  // survive. createframed's own DYED cardboard recipes are untouched.
  'createframed:bound_cardboard/base_from_modded_string',
  'createframed:item_application/base_from_modded_string',

  // soul_soil -> soul_sand milling exists twice: stones at 150 ticks and
  // createsifter at 500. removing the SLOWER one is the no-op choice - the
  // faster recipe is the one a mill would use anyway, so nothing gets slower.
  // removing stones' instead would have been a stealth nerf.
  'createsifter:milling/soul_sand'
]

ServerEvents.recipes(event => {
  // chute: same name as create's chute, create wins
  event.remove({ output: 'quark:chute' })
  // rope: supplementaries' rope is load-bearing for its pulleys etc
  event.remove({ output: 'quark:rope' })
  // seed pouch: sophisticated backpacks covers it
  event.remove({ output: 'quark:seed_pouch' })
  // new stone types + big stone clusters are off (create: stones + yung's cave biomes own stone)
  event.remove({ output: /^quark:.*(limestone|jasper|shale|myalite).*$/ })
  // monster box: apotheosis rogue spawners are the one spawner system
  event.remove({ output: 'quark:monster_box' })

  // forEach gives each id its own scope, which a for-of body would not -
  // see the rhino const-hoisting trap in the kubejs gotchas note.
  DUPLICATE_RECIPE_IDS.forEach(function (id) {
    event.remove({ id: id })
  })
})
