// the sealed claymore/sword/rapier relics (reliquified irons spells 0.2.7) register the PLAYER as a summon
// owned by the weapon (initSummon is called with the arguments swapped). iron's spellbooks cancels every
// dimension change for anything that has a summon owner, so wearing one in a curio slot blocks the nether.
// upstream: Octo-Studios/reliquified-irons-spells-n-spellbooks issue 4. until it is fixed, drop the bogus
// owner right before the player travels. runs first so iron's own cancel handler sees no owner.
var SummonManager = Java.loadClass('io.redspace.ironsspellbooks.capabilities.magic.SummonManager')
var TRAVEL = 'net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent'

function dropBogusOwner(event) {
  try {
    var entity = event.entity
    if (!entity || !entity.isPlayer()) return
    if (SummonManager.getOwner(entity) != null) {
      SummonManager.removeSummon(entity)
      console.info('summon travel fix: cleared bogus summon owner on ' + entity.username)
    }
  } catch (e) {
    console.info('summon travel fix failed: ' + e)
  }
}

try {
  NativeEvents.onEvent('highest', TRAVEL, dropBogusOwner)
} catch (e) {
  NativeEvents.onEvent(TRAVEL, dropBogusOwner)
}
