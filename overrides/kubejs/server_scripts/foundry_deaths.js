// death coords, whispered to the person who died, plus /lastdeath to hear them again.
// corail tombstone already keeps the items - this is purely "where was i". nothing here
// touches the vanilla death broadcast: suppressing that needs a neoforge mixin and is still
// parked (notes/config-review-08-26.md).
//
// 08-29, all javap'd against the pinned jar on the server
// (/nix/store/z1qidl0dgva2sdmlfycppk4wmjg66sw3-kubejs-neoforge-2101.7.2-build.374.jar):
//
//   EntityEvents.DEATH is real and is a TargetedEventHandler registered with supportsTarget(),
//   NOT requiredTarget() - so the untargeted one-argument form used below is legal.
//   EventHandler.call() branches on args.length: 1 arg calls listen(cx, type, null, handler).
//   the targeted form EntityEvents.death('minecraft:player', cb) would also parse, but a target
//   that fails to resolve fires nothing and says nothing, and there is no way to live-test that
//   from here. one isPlayer branch per mob death is the cheaper mistake.
//
//   the event class is LivingEntityDeathKubeEvent with getEntity() and getSource(), so
//   event.entity is the LivingEntity that died and event.source is the DamageSource.
//
//   persistentData SURVIVES DEATH in this build. EntityMixin backs player.persistentData with
//   a mixin field (kjs$persistentData, saved into entity nbt as "KubeJSPersistentData"), and a
//   respawn builds a brand new ServerPlayer, so that alone would lose it. what saves it is
//   KubeJSPlayerEventHandler.cloned(PlayerEvent$Clone), whose bytecode does
//   newPlayer.kjs$setRawPersistentData(oldPlayer.kjs$getRawPersistentData()) with no
//   isWasDeath() gate on the copy. so writing on death and reading after respawn works.
//
//   position and dimension come off player.block, which is kjs$getBlock() ->
//   level.kjs$getBlock(entity.blockPosition()) -> LevelBlock. LevelBlock is a KubeJS interface
//   with plain getX()/getY()/getZ()/getDimension(), so `.x .y .z .dimension` are unambiguous
//   bean properties. deliberately NOT player.level.dimension: vanilla Level also has a method
//   literally named dimension(), which would shadow the kjs$getDimension bean property.
//
// 08-29: top-level names are prefixed `death` on purpose. kubejs server_scripts can share a
// rhino scope, so a bare helper name here could collide with a sibling script's.
const deathKeyX = 'foundry_death_x'
const deathKeyY = 'foundry_death_y'
const deathKeyZ = 'foundry_death_z'
const deathKeyDim = 'foundry_death_dim'
const deathKeyTime = 'foundry_death_time'

// "minecraft:the_nether" -> "the nether". a modded dimension keeps its namespace off and its
// underscores turned into spaces, which reads fine for everything in this pack.
function deathPrettyDim(dim) {
  var s = String(dim)
  var colon = s.indexOf(':')
  if (colon >= 0) s = s.substring(colon + 1)
  s = s.split('_').join(' ')
  if (s === 'overworld') return 'the overworld'
  return s
}

function deathAgo(ms) {
  if (ms < 60000) return 'just now'
  var mins = Math.floor(ms / 60000)
  if (mins < 60) return mins + 'm ago'
  var hours = Math.floor(mins / 60)
  var rem = mins % 60
  if (hours < 24) return hours + 'h ' + rem + 'm ago'
  return Math.floor(hours / 24) + 'd ' + (hours % 24) + 'h ago'
}

function deathTell(player, x, y, z, dim, prefix) {
  player.tell(Text.of(prefix + x + ' ' + y + ' ' + z).gold())
  player.tell(Text.of('  in ' + deathPrettyDim(dim)).gray())
}

EntityEvents.death(event => {
  try {
    // 08-29: `var`, not `const`. rhino hoists a const declared inside a handler body to the
    // shared script scope, so the second death would throw "redeclaration of var player"
    // and keep throwing forever - the exact bug that filled 89MB of latest.log on 08-29.
    var player = event.entity
    // kjs$isPlayer() -> the `player` bean property. picked over `.type` because vanilla
    // Entity.getType() would compete with kjs$getType() for the `type` property name, and
    // there is no vanilla isPlayer()/getPlayer() on Entity to compete with this one.
    if (!player.player) return
    var b = player.block
    var x = b.x
    var y = b.y
    var z = b.z
    var dim = String(b.dimension)
    var pd = player.persistentData
    pd.putInt(deathKeyX, x)
    pd.putInt(deathKeyY, y)
    pd.putInt(deathKeyZ, z)
    pd.putString(deathKeyDim, dim)
    pd.putLong(deathKeyTime, Date.now())
    deathTell(player, x, y, z, dim, 'you died at ')
    player.tell(Text.of('  /lastdeath says it again').gray())
  } catch (e) {
    // never throw into the event. a missing coords line must not break dying.
    console.error('foundry: death coords whisper failed - ' + e)
  }
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  // 08-29: like every other new literal, /lastdeath needs a full server RESTART to appear.
  // the dispatcher is built once at startup; /reload re-runs this file and registers nothing.
  event.register(Commands.literal('lastdeath').executes(ctx => {
    try {
      var p = ctx.source.player
      if (!p) return 0
      var pd = p.persistentData
      if (!pd.contains(deathKeyDim)) {
        p.tell(Text.of('no death on record. keep it that way').gray())
        return 1
      }
      var x = pd.getInt(deathKeyX)
      var y = pd.getInt(deathKeyY)
      var z = pd.getInt(deathKeyZ)
      var dim = pd.getString(deathKeyDim)
      deathTell(p, x, y, z, dim, 'last death at ')
      // getLong returns 0 for a key written before deathKeyTime existed - treat that as
      // "no timestamp" rather than printing an age measured from 1970.
      var t = pd.getLong(deathKeyTime)
      if (t > 0) p.tell(Text.of('  ' + deathAgo(Date.now() - t)).gray())
      return 1
    } catch (e) {
      console.error('foundry: /lastdeath failed - ' + e)
      return 0
    }
  }))
})
