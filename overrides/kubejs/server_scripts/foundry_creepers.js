// creeper explosions no longer break blocks (patrick). the explosion still happens and still hurts whatever it
// hits, it just leaves the terrain alone. the vanilla mobGriefing gamerule is global (endermen, villagers,
// ravagers), so this checks the exploder instead. vanilla creepers only, charged ones included, modded creepers
// keep their own rules. TNT and everything else explode as normal.
LevelEvents.afterExplosion(event => {
  const who = event.exploder
  if (!who || String(who.type) !== 'minecraft:creeper') return
  event.removeAllAffectedBlocks()
})
