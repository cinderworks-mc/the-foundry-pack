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
    .requirements([RecipeRequirement.maxY(-20), RecipeRequirement.minSpeed(32.0), RecipeRequirement.maxSpeed(64.0)])
    .id('foundry:extruding/sky_stone')

  // gem dust: lava + amethyst block over calcite, ~1 in 2 every 4 presses. amethyst sink for sockets.
  X.extruding(Output.of(Item.of('apotheosis:gem_dust'), 0.55),
    [BlockPredicate.of('minecraft:lava'), BlockPredicate.of('minecraft:amethyst_block')])
    .catalyst('minecraft:calcite')
    .requiredBonks(4)
    .id('foundry:extruding/gem_dust')

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
