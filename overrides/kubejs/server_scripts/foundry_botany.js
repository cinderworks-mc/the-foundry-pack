// modded trees that botany trees (the mod that defines the tree crops) does not cover, so botany pots
// refused their saplings: thaumaturge, goety, ice and fire's dreadwood, ghosts, witchery and
// tropicraft. trunk and leaves come straight from each sapling's own configured worldgen feature.
// same shape as botany trees' own aether/skyroot files: a block_derived_crop recipe pointing at a
// tree_drops loot table (logs always, the sapling back at 5%, leaves only with shears).

const BOTANY_TREES = [
  { id: 'greatwood', sapling: 'thaumaturge:sapling_greatwood', log: 'thaumaturge:log_greatwood', leaves: 'thaumaturge:leaves_greatwood' },
  { id: 'silverwood', sapling: 'thaumaturge:sapling_silverwood', log: 'thaumaturge:log_silverwood', leaves: 'thaumaturge:leaves_silverwood' },
  { id: 'goety_chorus', sapling: 'goety:chorus_sapling', log: 'goety:chorus_log', leaves: 'goety:chorus_leaves' },
  { id: 'goety_haunted', sapling: 'goety:haunted_sapling', log: 'goety:haunted_log', leaves: null },
  { id: 'goety_pine', sapling: 'goety:pine_sapling', log: 'goety:pine_log', leaves: 'goety:pine_leaves' },
  { id: 'goety_rotten', sapling: 'goety:rotten_sapling', log: 'goety:rotten_log', leaves: 'goety:rotten_leaves' },
  { id: 'goety_windswept', sapling: 'goety:windswept_sapling', log: 'goety:windswept_log', leaves: 'goety:windswept_leaves' },
  { id: 'iceandfire_dreadwood', sapling: 'iceandfire:dreadwood_sapling', log: 'iceandfire:dreadwood_log', leaves: 'iceandfire:dreadwood_leaves' },
  { id: 'ghosts_haunted', sapling: 'ghosts:haunted_sapling', log: 'ghosts:haunted_log', leaves: 'ghosts:haunted_leaves' },
  { id: 'witchery_alder', sapling: 'witchery:alder_sapling', log: 'witchery:alder_log', leaves: 'witchery:alder_leaves' },
  { id: 'witchery_hawthorn', sapling: 'witchery:hawthorn_sapling', log: 'witchery:hawthorn_log', leaves: 'witchery:hawthorn_leaves' },
  { id: 'witchery_rowan', sapling: 'witchery:rowan_sapling', log: 'witchery:rowan_log', leaves: 'witchery:rowan_leaves' },
  { id: 'tropicraft_palm', sapling: 'tropicraft:palm_sapling', log: 'tropicraft:palm_log', leaves: 'tropicraft:palm_leaves' },
  { id: 'tropicraft_mahogany', sapling: 'tropicraft:mahogany_sapling', log: 'tropicraft:mahogany_log', leaves: 'tropicraft:mahogany_leaves', extra: { item: 'tropicraft:mahogany_nut', chance: 0.25, min: 1, max: 2 } },
  { id: 'tropicraft_jocote', sapling: 'tropicraft:jocote_sapling', log: 'tropicraft:jocote_log', leaves: 'tropicraft:jocote_leaves', extra: { item: 'tropicraft:jocote', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_papaya', sapling: 'tropicraft:papaya_sapling', log: 'tropicraft:papaya_log', leaves: 'tropicraft:papaya_leaves', extra: { item: 'tropicraft:papaya', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_plantain', sapling: 'tropicraft:plantain_sapling', log: 'tropicraft:plantain_stem', leaves: 'tropicraft:plantain_leaves', extra: { item: 'tropicraft:green_plantain_bunch', chance: 0.3, min: 1, max: 2 } },
  { id: 'tropicraft_orange', sapling: 'tropicraft:orange_sapling', log: 'minecraft:oak_log', leaves: 'tropicraft:orange_leaves', extra: { item: 'tropicraft:orange', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_lemon', sapling: 'tropicraft:lemon_sapling', log: 'minecraft:oak_log', leaves: 'tropicraft:lemon_leaves', extra: { item: 'tropicraft:lemon', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_lime', sapling: 'tropicraft:lime_sapling', log: 'minecraft:oak_log', leaves: 'tropicraft:lime_leaves', extra: { item: 'tropicraft:lime', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_grapefruit', sapling: 'tropicraft:grapefruit_sapling', log: 'minecraft:oak_log', leaves: 'tropicraft:grapefruit_leaves', extra: { item: 'tropicraft:grapefruit', chance: 0.3, min: 1, max: 3 } },
  { id: 'tropicraft_red_mangrove', sapling: 'tropicraft:red_mangrove_propagule', log: 'tropicraft:red_mangrove_log', leaves: 'tropicraft:red_mangrove_leaves' },
  { id: 'tropicraft_black_mangrove', sapling: 'tropicraft:black_mangrove_propagule', log: 'tropicraft:black_mangrove_log', leaves: 'tropicraft:black_mangrove_leaves' },
  { id: 'tropicraft_tall_mangrove', sapling: 'tropicraft:tall_mangrove_propagule', log: 'tropicraft:light_mangrove_log', leaves: 'tropicraft:tall_mangrove_leaves' },
  { id: 'tropicraft_tea_mangrove', sapling: 'tropicraft:tea_mangrove_propagule', log: 'tropicraft:light_mangrove_log', leaves: 'tropicraft:tea_mangrove_leaves' }
]

function botanyDrops(t) {
  var pools = [
    {
      rolls: 1.0, bonus_rolls: 0.0,
      entries: [{
        type: 'minecraft:item', name: t.log,
        functions: [{ function: 'minecraft:set_count', add: false, count: { type: 'minecraft:uniform', min: 1, max: 4 } }]
      }]
    },
    {
      rolls: 1.0, bonus_rolls: 0.0,
      entries: [{
        type: 'minecraft:item', name: t.sapling,
        conditions: [{ condition: 'minecraft:random_chance', chance: 0.05 }]
      }]
    }
  ]
  if (t.leaves) {
    pools.push({
      rolls: 1.0, bonus_rolls: 0.0,
      entries: [{
        type: 'minecraft:item', name: t.leaves,
        conditions: [{ condition: 'minecraft:match_tool', predicate: { items: 'minecraft:shears' } }],
        functions: [{ function: 'minecraft:set_count', add: false, count: { type: 'minecraft:uniform', min: 1, max: 3 } }]
      }]
    })
  }
  // fruit and nut trees also hand over what they grow
  if (t.extra) {
    pools.push({
      rolls: 1.0, bonus_rolls: 0.0,
      entries: [{
        type: 'minecraft:item', name: t.extra.item,
        conditions: [{ condition: 'minecraft:random_chance', chance: t.extra.chance }],
        functions: [{ function: 'minecraft:set_count', add: false, count: { type: 'minecraft:uniform', min: t.extra.min, max: t.extra.max } }]
      }]
    })
  }
  return { type: 'minecraft:block', random_sequence: 'foundry:tree_drops/' + t.id, pools: pools }
}

ServerEvents.generateData('after_mods', function (event) {
  BOTANY_TREES.forEach(function (t) {
    event.json('foundry:loot_table/tree_drops/' + t.id, botanyDrops(t))
  })
})

ServerEvents.recipes(function (event) {
  BOTANY_TREES.forEach(function (t) {
    event.custom({
      type: 'botanypots:block_derived_crop',
      block: t.sapling,
      grow_time: 2400,
      drops: [{ type: 'botanypots:loot_table', table_id: 'foundry:tree_drops/' + t.id }]
    }).id('foundry:botanypots/' + t.id)
  })
})
