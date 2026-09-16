// hide the items whose quark modules are off (see server_scripts/foundry_removals.js).
// almost unified hides unified duplicates on its own (recipe_viewer_hiding = true).
// kubejs 2101 (7.x): JEIEvents is gone, recipe viewer hooks are RecipeViewerEvents.
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('quark:chute')
  event.remove('quark:rope')
  event.remove('quark:seed_pouch')
  event.remove('quark:monster_box')
  event.remove(/^quark:.*(limestone|jasper|shale|myalite).*$/)

  // cataclysm_spellbooks: 11 items that ARE registered but have no working recipe and
  // no loot table anywhere in the pack (audit 3.7, 08-30-2026). the mod declares 77
  // items in its own lang file and never registers 25 of them, and 26 of its 65 recipe
  // files reference one of those 25 - so the ingredient chain these 11 need
  // (technomancy_rune, mechanical_scrap, mechanical_weapon_parts, excel_upgrade_*)
  // does not exist. hiding them rather than inventing recipes: writing progression for
  // a mod whose own registry is broken means an upstream fix can contradict us later.
  // upstream issue drafted 08-30. delete this block the day the mod registers its
  // intermediates - the items come straight back.
  event.remove('cataclysm_spellbooks:engineer_boots')
  event.remove('cataclysm_spellbooks:engineer_hood')
  event.remove('cataclysm_spellbooks:engineer_leggings')
  event.remove('cataclysm_spellbooks:engineer_suit')
  event.remove('cataclysm_spellbooks:excelsius_power_chestplate')
  event.remove('cataclysm_spellbooks:excelsius_power_visors')
  event.remove('cataclysm_spellbooks:excelsius_resist_chestplate')
  event.remove('cataclysm_spellbooks:excelsius_resist_visors')
  event.remove('cataclysm_spellbooks:excelsius_speed_chestplate')
  event.remove('cataclysm_spellbooks:excelsius_speed_visors')
  event.remove('cataclysm_spellbooks:technomancy_upgrade_orb')
})
