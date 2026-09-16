// foundry_sleep.js - bot-excluded night skip, twin of the hearth's
// calcifer:sleep/check datapack function (same half-of-humans threshold, same
// announce line - twin rule, never let the wording drift). notpatrickhere is
// infrastructure and never counts toward sleep. vanilla
// players_sleeping_percentage is parked at 101 on the server so its own
// counter - which cannot exclude anyone - never fires first.
//
// rhino rules per foundry_sessions.js's header: nothing declared at file
// scope, everything lives inside the callback.

ServerEvents.tick(event => {
  if (event.server.tickCount % 20 !== 0) return // once a second, like the hearth
  var overworld = event.server.getLevel('minecraft:overworld')
  if (!overworld) return

  // bed-usable night window, same bounds the hearth checks
  var tod = overworld.getDayTime() % 24000
  if (tod < 12542 || tod > 23458) return

  var humans = 0
  var asleep = 0
  event.server.players.forEach(p => {
    if (String(p.username) === 'notpatrickhere') return
    if (p.isSpectator()) return
    humans++
    if (p.isSleeping()) asleep++
  })

  if (asleep < 1) return
  if (asleep * 2 < humans) return

  event.server.runCommandSilent('time set day')
  event.server.runCommandSilent('tellraw @a {"text":"enough of you are asleep. dawn comes early","color":"gray","italic":true}')
})
