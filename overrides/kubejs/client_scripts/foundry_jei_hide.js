// hide the items whose quark modules are off (see server_scripts/foundry_removals.js).
// almost unified hides unified duplicates on its own (recipe_viewer_hiding = true).
// kubejs 2101 (7.x): JEIEvents is gone, recipe viewer hooks are RecipeViewerEvents.
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('quark:chute')
  event.remove('quark:rope')
  event.remove('quark:seed_pouch')
  event.remove('quark:monster_box')
  event.remove(/^quark:.*(limestone|jasper|shale|myalite).*$/)
})
