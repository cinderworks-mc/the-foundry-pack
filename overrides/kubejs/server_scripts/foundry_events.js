// event log for the playtime site's chronicle. same design rules as
// foundry_sessions.js (which this file leans on): in-process kubejs hook,
// data under kubejs/config/ so deploys and nixos switches leave it alone,
// JsonIO.readJson + toJsonElement for the gson round trip, and nothing here
// ever invents data it did not observe.
//
// SHARED SCRIPT SCOPE. rhino hoists every const/function in server_scripts
// onto ONE shared scope, so this file deliberately REUSES foundry_sessions.js
// helpers (playerUuid, toJsonElement, readDoc) instead of redefining them,
// and every name it introduces carries an ev prefix to stay collision-free.
//
// on-disk shape, kubejs/config/foundry_events/events.json:
//   { "v": 1, "events": [ { "ms": 1756503195186, "kind": "death",
//       "uuid": "...", "name": "patrickhere", "detail": "lava" } ] }
// kinds: "death" (detail = damage source type) and "boss_kill" (detail =
// entity type id). the array is capped: oldest entries fall off past EV_CAP.
// a read failure means no write, same corrupt-file rule as sessions.

const EV_PATH = 'kubejs/config/foundry_events/events.json'
const EV_CAP = 800

// boss ids worth chronicling. UNVERIFIED against the live registry on purpose:
// a wrong id here just never matches, it cannot break anything.
const EV_BOSSES = {
  'minecraft:ender_dragon': 1, 'minecraft:wither': 1, 'minecraft:warden': 1,
  'cataclysm:ender_guardian': 1, 'cataclysm:ignis': 1,
  'cataclysm:netherite_monstrosity': 1, 'cataclysm:the_harbinger': 1,
  'cataclysm:the_leviathan': 1, 'cataclysm:ancient_remnant': 1,
  'cataclysm:maledictus': 1, 'cataclysm:kobolediator': 1, 'cataclysm:scylla': 1
}

function evAppend(kind, uuid, name, detail) {
  try {
    var got = readDoc(EV_PATH)
    if (got.failed) {
      console.error('foundry: events.json unreadable, refusing to write')
      return
    }
    var doc = got.doc || { v: 1, events: [] }
    if (!doc.events) doc.events = []
    doc.events.push({ ms: Date.now(), kind: kind, uuid: uuid, name: name, detail: detail })
    while (doc.events.length > EV_CAP) doc.events.shift()
    JsonIO.write(EV_PATH, toJsonElement(doc))
  } catch (e) {
    console.error('foundry: event append failed - ' + e)
  }
}

EntityEvents.death(event => {
  try {
    var entity = event.entity
    if (!entity) return
    var typeId = String(entity.type)
    if (entity.player) {
      // 09-01: event.source.type resolves to a method object in rhino (the one
      // live death logged detail "Function"), so read the damage type id via
      // msgId with a getType fallback, and drop anything that still stringifies
      // to a function.
      var src = ''
      try { src = String(event.source.msgId) } catch (e1) { src = '' }
      if (!src || src === 'undefined' || src.indexOf('unction') >= 0) {
        try { src = String(event.source.getType()) } catch (e2) { src = '' }
      }
      if (src.indexOf('unction') >= 0) src = ''
      evAppend('death', playerUuid(entity), String(entity.username || entity.name.string), src)
      return
    }
    if (EV_BOSSES[typeId]) {
      var killer = null
      try { killer = event.source.player } catch (e2) { killer = null }
      if (killer) {
        evAppend('boss_kill', playerUuid(killer), String(killer.username || killer.name.string), typeId)
      }
    }
  } catch (e) {
    console.error('foundry: event death handler failed - ' + e)
  }
})
