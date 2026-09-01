// cohesion pass 08-26: jei hides for the losers in server_scripts/foundry_cohesion_removals.js.
// same regexes, same winners. steel / cast iron / zinc sheet are NOT here: almost unified hides
// those itself (recipe_viewer_hiding = true, tfmg wins by mod_priorities).
RecipeViewerEvents.removeEntries('item', event => {
  // quark -> ecologics: azalea wood set
  event.remove(/^quark:(stripped_)?azalea_/)
  event.remove(/^quark:hollow_azalea_log$/)
  // quark -> create: stone pillars
  event.remove(/^quark:(andesite|diorite|granite|calcite|dripstone|tuff)_pillar$/)
  // quark -> create: framed glass + dyed variants
  event.remove(/^quark:([a-z_]+_)?framed_glass(_pane)?$/)
  // quark -> supplementaries: gold bars, stone lamp
  event.remove('quark:gold_bars')
  event.remove('quark:stone_lamp')
  // quark -> farmers delight: veggie crates
  event.remove(/^quark:(potato|carrot|beetroot)_crate$/)
  // quark -> sophisticated backpacks: backpack
  event.remove('quark:backpack')

  // createdeco -> create: bars, doors, industrial iron windows
  event.remove(/^createdeco:(andesite|brass|copper)_bars$/)
  event.remove(/^createdeco:(andesite|brass)_door$/)
  event.remove(/^createdeco:industrial_iron_window(_pane)?$/)
  // createdeco -> quark: iron ladder
  event.remove('createdeco:iron_ladder')
  // createdeco -> create vibrant vaults: dyed shipping containers
  event.remove(/^createdeco:[a-z_]+_shipping_container$/)

  // dndecor -> createdeco: catwalks + sheet metal
  event.remove(/^dndecor:(andesite|brass|copper|iron|zinc)_catwalk$/)
  event.remove(/^dndecor:(andesite|brass|copper|iron|zinc)_sheet_metal$/)

  // bits n bobs -> interiors: chairs; -> dndecor: brass lamp
  event.remove(/^bits_n_bobs:[a-z_]+_chair$/)
  event.remove('bits_n_bobs:brass_lamp')

  // create framed -> createdeco: metal windows
  event.remove(/^createframed:(brass|copper|zinc)_window(_pane)?$/)

  // create c&a + create encased -> create connected: brass gearbox family
  event.remove(/^create_ca:(vertical_)?brass_gearbox$/)
  event.remove(/^create_ca:inverted_(clutch|gearshift)$/)
  event.remove('createcasing:brass_gearbox')

  // tfmg -> create encased: brass fluid blocks
  event.remove(/^tfmg:brass_(fluid_valve|mechanical_pump|smart_fluid_pipe)$/)

  // create things and misc -> tfmg / slice and dice / steam n rails
  event.remove('create_things_and_misc:neon_tube')
  event.remove(/^create_things_and_misc:sprinkler(on)?$/)
  event.remove('create_things_and_misc:train_stop')

  // first-draft missing-model list: create connected registers 16 dye depot fan catalysts and dye
  // depot is not in the pack (ids checked in the jar lang). the other compat catalysts (freezing,
  // seething, enriched, ...) have no mod name in their id, so they are listed in the notes to
  // eyeball in jei rather than guessed here.
  event.remove(/^create_connected:dye_depot_[a-z]+_fan_dyeing_catalyst$/)
})

// create_sa jetpack + flamethrower lose to create jetpack / tfmg (patrick 08-26)
RecipeViewerEvents.removeEntries('item', event => {
  event.remove(/^create_sa:.*(jetpack|flamethrower).*$/)
})
