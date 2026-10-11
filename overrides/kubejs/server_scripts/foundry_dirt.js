// delightful dirt grows flowers and grass on top of itself from its own random tick, and the plants
// then stop it spawning because it needs bare air above. the mod has no switch for it, so this clears
// the plants. it learns each dirt block when the block random ticks and sweeps the plants above every
// couple of seconds, so a restart forgets them until they tick again (about a minute).
// only plants are touched: short grass, ferns, flowers and the tall versions of those.

const DIRT_ID = 'mob_grinding_utils:delightful_dirt'
const DIRT_PLANTS = ['minecraft:short_grass', 'minecraft:tall_grass', 'minecraft:fern', 'minecraft:large_fern']
const DIRT_SPOT_CAP = 4000
const dirtSpots = {}
var dirtSpotCount = 0
var dirtCleared = 0

function dirtIsPlant(block) {
  var id = String(block.id)
  return DIRT_PLANTS.indexOf(id) >= 0 || block.hasTag('minecraft:flowers')
}

function dirtClear(level, x, y, z) {
  var up = level.getBlock(x, y + 1, z)
  if (!dirtIsPlant(up)) return false
  var id = String(up.id)
  var upper = level.getBlock(x, y + 2, z)
  // a tall plant is two blocks, take both or the top half pops off as an item
  if (String(upper.id) === id) upper.set('minecraft:air')
  up.set('minecraft:air')
  dirtCleared++
  if (dirtCleared <= 10) console.info('foundry dirt: cleared ' + id + ' above ' + x + ',' + y + ',' + z)
  return true
}

BlockEvents.randomTick(DIRT_ID, function (event) {
  var b = event.block
  var dim = String(b.level.dimension)
  var key = dim + '|' + b.x + '|' + b.y + '|' + b.z
  if (!dirtSpots[key] && dirtSpotCount < DIRT_SPOT_CAP) {
    dirtSpots[key] = [dim, b.x, b.y, b.z]
    dirtSpotCount++
  }
  dirtClear(b.level, b.x, b.y, b.z)
})

ServerEvents.tick(function (event) {
  if (event.server.tickCount % 40 !== 0 || dirtSpotCount === 0) return
  Object.keys(dirtSpots).forEach(function (key) {
    var s = dirtSpots[key]
    var level = event.server.getLevel(s[0])
    if (!level) return
    if (String(level.getBlock(s[1], s[2], s[3]).id) !== DIRT_ID) {
      delete dirtSpots[key]
      dirtSpotCount--
      return
    }
    dirtClear(level, s[1], s[2], s[3])
  })
})
