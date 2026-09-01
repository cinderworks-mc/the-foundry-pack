// recipes for items whose quark module is turned off in config/quark-common.toml.
// quark still registers the items, so without this they stay craftable.
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
})
