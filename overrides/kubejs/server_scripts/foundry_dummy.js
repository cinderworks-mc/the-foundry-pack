// target dummies spawn with apotheosis pinnacle armor like any other mob, which hides your real damage.
// name one "raw" with a name tag and it loses those modifiers within a second, so it reads true damage.

const DUMMY_ID = 'dummmmmmy:target_dummy'
const DUMMY_APOTH_MODS = [
  ['minecraft:generic.armor', 'apotheosis:pinnacle/armor'],
  ['minecraft:generic.armor_toughness', 'apotheosis:pinnacle/armor_toughness'],
  ['apothic_attributes:prot_pierce', 'apotheosis:pinnacle/prot_pierce'],
  ['apothic_attributes:armor_pierce', 'apotheosis:pinnacle/armor_pierce']
]

ServerEvents.tick(function (event) {
  if (event.server.tickCount % 20 !== 0) return
  DUMMY_APOTH_MODS.forEach(function (m) {
    event.server.runCommandSilent('execute as @e[type=' + DUMMY_ID + ',name=raw] run attribute @s ' + m[0] + ' modifier remove ' + m[1])
  })
})
