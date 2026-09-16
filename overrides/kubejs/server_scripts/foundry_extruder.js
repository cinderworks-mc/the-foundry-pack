// create: mechanical extruder recipes for the foundry. four additions, decided 08-30-2026
// after the survey in the drop folder (foundry-extruder-survey.md). the extruder presses the
// two side blocks together, the block underneath is the catalyst, every press is a bonk.
// ids verified against the live jars (see foundry-mechanical-extruder.md). rhino rules: var only.

ServerEvents.recipes(function (event) {
  var X = event.recipes.create_mechanical_extruder

  // rich soil: water + dirt over a compost block, one every 4 presses. bulk route for the farm side.
  X.extruding(Item.of('farmersdelight:rich_soil'),
    [BlockPredicate.of('minecraft:water'), BlockPredicate.of('minecraft:dirt')])
    .catalyst('farmersdelight:organic_compost')
    .requiredBonks(4)
    .id('foundry:extruding/rich_soil')

  // sky stone: obsidian + lava over smooth sky stone (you need one meteorite first). brass only,
  // deep, eats the lava, ~1 in 3, and only inside a 32-64 rpm band so it cannot be maxed out.
  X.extruding(Output.of(Item.of('ae2:sky_stone_block'), 0.35),
    [BlockPredicate.of('minecraft:obsidian'), BlockPredicate.of('minecraft:lava')])
    .catalyst('ae2:smooth_sky_stone_block')
    .advanced(true)
    .consumeBlocks([false, true])
    .requirements([RecipeRequirement.minSpeed(32.0), RecipeRequirement.maxSpeed(64.0)])
    .id('foundry:extruding/sky_stone')

  // gem dust: lava + amethyst block over calcite, ~1 in 2 every 4 presses. amethyst sink for sockets.
  X.extruding(Output.of(Item.of('apotheosis:gem_dust'), 0.55),
    [BlockPredicate.of('minecraft:lava'), BlockPredicate.of('minecraft:amethyst_block')])
    .catalyst('minecraft:calcite')
    .requiredBonks(4)
    .id('foundry:extruding/gem_dust')

  // height caps dropped pack-wide 09-14 ("feels like an odd restriction"). the mod gates its
  // water+lava stones by y band (deepslate y<=0, andesite/diorite/granite y 0-60); we readd
  // them bandless. overlap is fine - cobblestone already matches everywhere with no reqs and
  // the extruder disambiguates multi-match. speed caps kept, rest identical. our sky stone
  // recipe above lost its maxY(-20) the same day, rpm band kept.
  event.remove({ id: 'create_mechanical_extruder:extruding/deepslate' })
  X.extruding(Item.of('minecraft:deepslate'),
    [BlockPredicate.of('minecraft:water'), BlockPredicate.of('minecraft:lava')])
    .requirements([RecipeRequirement.maxSpeed(16.0)])
    .id('foundry:extruding/deepslate')
  // advanced netherrack: the mod's overworld route (brass + netherrack catalyst) eats its lava
  // every press. patrick 09-14: needing the brass extruder IS the balance, drop the lava tax.
  // the free non-advanced recipe stays nether-only (biome req untouched).
  event.remove({ id: 'create_mechanical_extruder:extruding/advanced_netherrack' })
  X.extruding(Item.of('minecraft:netherrack'),
    [BlockPredicate.of('minecraft:blue_ice'), BlockPredicate.of('minecraft:lava')])
    .catalyst('minecraft:netherrack')
    .advanced(true)
    .id('foundry:extruding/advanced_netherrack')

  var stones = ['andesite', 'diorite', 'granite']
  for (var s = 0; s < stones.length; s++) {
    event.remove({ id: 'create_mechanical_extruder:extruding/' + stones[s] })
    X.extruding(Item.of('minecraft:' + stones[s]),
      [BlockPredicate.of('minecraft:water'), BlockPredicate.of('minecraft:lava')])
      .id('foundry:extruding/' + stones[s])
  }

  // orestones: lava + water over a block of the same orestone makes more of it, cobble-gen style.
  // the mod's own versions (lapis/iron/gold/prismarine blocks + lava) come out so ours is the only path.
  var ores = ['create:asurine', 'create:crimsite', 'create:ochrum', 'create:veridium']
  for (var i = 0; i < ores.length; i++) {
    var ore = ores[i]
    event.remove({ type: 'create_mechanical_extruder:extruding', output: ore })
    X.extruding(Item.of(ore),
      [BlockPredicate.of('minecraft:lava'), BlockPredicate.of('minecraft:water')])
      .catalyst(ore)
      .requiredBonks(2)
      .id('foundry:extruding/' + ore.split(':')[1])
  }
})
