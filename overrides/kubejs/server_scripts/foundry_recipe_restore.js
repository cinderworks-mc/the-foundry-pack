// emergency restore 08-28: a growing list of vanilla recipes (anything using a generic
// material tag - #minecraft:planks, #minecraft:stone_tool_materials, #minecraft:wooden_slabs,
// #minecraft:logs, #minecraft:coals) came up "Unknown recipe" on a fresh boot. not removed by
// any script/mod we could find (checked every kubejs script, every mod jar's data/minecraft/
// recipe/* and tags/item/planks.json, almostunified config - the tags themselves resolve fine
// via /execute if items, just the recipe files are missing from the loaded datapack).
// re-adding them verbatim from vanilla 1.21.1 (via mcmeta data mirror) until the actual cause
// is found. list may grow if more turn up broken.
ServerEvents.recipes(event => {
  event.shapeless('4x minecraft:stick', ['#minecraft:planks', '#minecraft:planks']).id('minecraft:stick')
  event.shaped('minecraft:crafting_table', ['XX', 'XX'], { X: '#minecraft:planks' }).id('minecraft:crafting_table')
  event.shaped('minecraft:chest', ['XXX', 'X X', 'XXX'], { X: '#minecraft:planks' }).id('minecraft:chest')
  event.shaped('minecraft:bookshelf', ['XXX', 'BBB', 'XXX'], { X: '#minecraft:planks', B: 'minecraft:book' }).id('minecraft:bookshelf')

  event.shaped('minecraft:wooden_pickaxe', ['XXX', ' # ', ' # '], { X: '#minecraft:planks', '#': 'minecraft:stick' }).id('minecraft:wooden_pickaxe')
  event.shaped('minecraft:wooden_axe', ['XX', 'X#', ' #'], { X: '#minecraft:planks', '#': 'minecraft:stick' }).id('minecraft:wooden_axe')
  event.shaped('minecraft:wooden_sword', ['X', 'X', '#'], { X: '#minecraft:planks', '#': 'minecraft:stick' }).id('minecraft:wooden_sword')
  event.shaped('minecraft:wooden_shovel', ['X', '#', '#'], { X: '#minecraft:planks', '#': 'minecraft:stick' }).id('minecraft:wooden_shovel')
  event.shaped('minecraft:wooden_hoe', ['XX', ' #', ' #'], { X: '#minecraft:planks', '#': 'minecraft:stick' }).id('minecraft:wooden_hoe')

  event.shaped('minecraft:stone_pickaxe', ['XXX', ' # ', ' # '], { X: '#minecraft:stone_tool_materials', '#': 'minecraft:stick' }).id('minecraft:stone_pickaxe')
  event.shaped('minecraft:stone_axe', ['XX', 'X#', ' #'], { X: '#minecraft:stone_tool_materials', '#': 'minecraft:stick' }).id('minecraft:stone_axe')
  event.shaped('minecraft:stone_sword', ['X', 'X', '#'], { X: '#minecraft:stone_tool_materials', '#': 'minecraft:stick' }).id('minecraft:stone_sword')
  event.shaped('minecraft:stone_shovel', ['X', '#', '#'], { X: '#minecraft:stone_tool_materials', '#': 'minecraft:stick' }).id('minecraft:stone_shovel')
  event.shaped('minecraft:stone_hoe', ['XX', ' #', ' #'], { X: '#minecraft:stone_tool_materials', '#': 'minecraft:stick' }).id('minecraft:stone_hoe')

  event.shaped('3x minecraft:ladder', ['# #', '###', '# #'], { '#': 'minecraft:stick' }).id('minecraft:ladder')

  event.shaped('minecraft:shield', ['WoW', 'WWW', ' W '], { W: '#minecraft:planks', o: 'minecraft:iron_ingot' }).id('minecraft:shield')

  event.shaped('minecraft:campfire', [' S ', 'SCS', 'LLL'], { C: '#minecraft:coals', L: '#minecraft:logs', S: 'minecraft:stick' }).id('minecraft:campfire')
  event.shaped('minecraft:barrel', ['PSP', 'P P', 'PSP'], { P: '#minecraft:planks', S: '#minecraft:wooden_slabs' }).id('minecraft:barrel')
  event.shaped('minecraft:composter', ['# #', '# #', '###'], { '#': '#minecraft:wooden_slabs' }).id('minecraft:composter')
  event.shaped('2x minecraft:tripwire_hook', ['I', 'S', '#'], { '#': '#minecraft:planks', I: 'minecraft:iron_ingot', S: 'minecraft:stick' }).id('minecraft:tripwire_hook')
  event.shaped('minecraft:jukebox', ['###', '#X#', '###'], { '#': '#minecraft:planks', X: 'minecraft:diamond' }).id('minecraft:jukebox')
  event.shaped('minecraft:note_block', ['###', '#X#', '###'], { '#': '#minecraft:planks', X: 'minecraft:redstone' }).id('minecraft:note_block')
  event.shapeless('4x minecraft:bowl', ['#minecraft:planks', '#minecraft:planks', '#minecraft:planks']).id('minecraft:bowl')
  event.shaped('minecraft:beehive', ['PPP', 'HHH', 'PPP'], { P: '#minecraft:planks', H: 'minecraft:honeycomb' }).id('minecraft:beehive')
  event.shaped('minecraft:lectern', ['SSS', ' B ', ' S '], { S: '#minecraft:wooden_slabs', B: 'minecraft:bookshelf' }).id('minecraft:lectern')
})
