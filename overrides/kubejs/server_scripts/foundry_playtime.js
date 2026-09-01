// /playtime [name] - reads the session files foundry_sessions.js already writes and says how
// long someone has been here. READ ONLY. nothing in this file writes to disk, ever: the session
// files are the tracker's, and JsonIO.write(path, null) deletes a file, so a read-side script
// has no business holding that hammer.
//
// on-disk shape (foundry_sessions.js owns it, see its header):
//   kubejs/config/foundry_sessions/<uuid>.json
//   { "uuid": "...", "name": "...", "names": [...],
//     "sessions": [ { "start": <epoch ms>, "end": <epoch ms|null> } ] }
// end === null means the session is open. an open session counts up to now, which is right for
// whoever is online and slightly generous for a session orphaned by a SIGKILL - the tracker
// never invents an end it did not observe, so neither does this.
// _meta.json and _online.json live in the same dir and are deliberately not touched here.
//
// 08-29, javap'd against the pinned jar
// (/nix/store/z1qidl0dgva2sdmlfycppk4wmjg66sw3-kubejs-neoforge-2101.7.2-build.374.jar):
//   JsonIO.readJson(path), NOT JsonIO.read - read() ends in Context.optionalMapOf(), which only
//   accepts Map-likes, and a gson JsonObject is not one, so read() returns null for every real
//   json file in this build. readJson returns null for a missing file and only throws on bad
//   json, which is exactly the missing-vs-corrupt split this needs.
//   the command argument uses event.arguments -> ArgumentTypeWrappers.WORD, whose interface is
//   create(event) to build the brigadier type and getResult(ctx, name) to read it back.
//   uuids come from player.profile.id (kjs$getProfile) - there is no getUUID() from scripts.
//
// 08-29: a NEW command literal needs a full server RESTART, not /reload.
// 08-29: every top-level name is prefixed `playtime` - kubejs server_scripts can share a rhino
// scope, and foundry_sessions.js already owns SESSION_DIR, readDoc, sessionPath and friends.
const playtimeDir = 'kubejs/config/foundry_sessions'
const playtimeUsercache = 'usercache.json'
const playtimeUuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

// america/chicago, 12 hour, mm-dd-yyyy. rhino has no Intl and its Date has no timezone support,
// so this goes through java.time. the kubejs class filter (kubejs.classfilter.txt in the jar)
// denies java.lang, java.io, java.nio, java.util.jar and java.util.zip and allows everything
// else by default, so java.time and java.util.Locale both load.
// if any of that fails the formatter is null and the last-seen line falls back to a relative
// age, which needs no timezone at all.
function playtimeMakeFormatter() {
  try {
    var Instant = Java.loadClass('java.time.Instant')
    var ZoneId = Java.loadClass('java.time.ZoneId')
    var DateTimeFormatter = Java.loadClass('java.time.format.DateTimeFormatter')
    var Locale = Java.loadClass('java.util.Locale')
    return {
      instant: Instant,
      fmt: DateTimeFormatter.ofPattern('MM-dd-yyyy h:mm a', Locale.US).withZone(ZoneId.of('America/Chicago'))
    }
  } catch (e) {
    console.error('foundry: could not build the america/chicago formatter, /playtime will print relative times - ' + e)
    return null
  }
}

const playtimeFormatter = playtimeMakeFormatter()

function playtimeStamp(ms) {
  if (!playtimeFormatter) return playtimeDuration(Date.now() - ms) + ' ago'
  try {
    return String(playtimeFormatter.fmt.format(playtimeFormatter.instant.ofEpochMilli(ms)))
  } catch (e) {
    console.error('foundry: could not format ' + ms + ' - ' + e)
    return playtimeDuration(Date.now() - ms) + ' ago'
  }
}

function playtimeDuration(ms) {
  if (ms < 60000) return 'under a minute'
  var mins = Math.floor(ms / 60000)
  var hours = Math.floor(mins / 60)
  if (hours < 1) return mins + 'm'
  return hours + 'h ' + (mins % 60) + 'm'
}

// returns the parsed json, or null for missing / unreadable. same readJson + toPrettyString +
// JSON.parse route foundry_sessions.js uses, and for the same reason.
function playtimeReadJson(path) {
  try {
    var el = JsonIO.readJson(path)
    if (el === null || el === undefined) return null
    return JSON.parse(JsonIO.toPrettyString(el))
  } catch (e) {
    console.error('foundry: could not read ' + path + ' - ' + e)
    return null
  }
}

// name -> { uuid, name }, or null. online players first (authoritative and free), then
// usercache.json in the server dir, which is a flat array of
// { name, uuid, expiresOn } and covers everyone who has ever joined.
function playtimeResolve(server, name) {
  var wanted = String(name).toLowerCase()
  var online = null
  try {
    online = server.players.find(p => String(p.username).toLowerCase() === wanted)
  } catch (e) {
    console.error('foundry: could not scan the online list for ' + name + ' - ' + e)
  }
  if (online) return { uuid: String(online.profile.id), name: String(online.username) }
  var cache = playtimeReadJson(playtimeUsercache)
  if (!cache || !cache.length) return null
  var hit = null
  // forEach, not for-of: rhino does not give a for-of body its own scope, so a const declared
  // in one would land on the shared script scope and throw on the second call. same trap as
  // foundry_first_join.js hit on 08-29.
  cache.forEach(entry => {
    if (hit) return
    if (!entry || !entry.name || !entry.uuid) return
    if (String(entry.name).toLowerCase() === wanted) hit = { uuid: String(entry.uuid), name: String(entry.name) }
  })
  return hit
}

// { totalMs, count, lastSeen, open }. an entry with a null end counts up to nowMs. a negative
// span (clock moved backwards between a join and a leave) contributes zero rather than
// subtracting time somebody actually played.
function playtimeSummarize(doc, nowMs) {
  var out = { totalMs: 0, count: 0, lastSeen: 0, open: false }
  if (!doc || !doc.sessions) return out
  doc.sessions.forEach(s => {
    if (!s || typeof s.start !== 'number') return
    out.count = out.count + 1
    var end = (s.end === null || s.end === undefined) ? nowMs : s.end
    if (s.end === null || s.end === undefined) out.open = true
    var span = end - s.start
    if (span > 0) out.totalMs = out.totalMs + span
    if (end > out.lastSeen) out.lastSeen = end
  })
  return out
}

function playtimeReport(source, who) {
  var target = who
  if (!target) {
    var self = source.player
    if (!self) return 0 // console with no name given, nothing to look up
    target = { uuid: String(self.profile.id), name: String(self.username) }
  }
  var teller = source.player
  var say = line => { if (teller) teller.tell(line) }
  if (!playtimeUuidRe.test(target.uuid)) {
    say(Text.of('that name has no uuid on file').gray())
    return 0
  }
  var doc = playtimeReadJson(playtimeDir + '/' + target.uuid + '.json')
  if (!doc) {
    say(Text.of(target.name + ' has no playtime on record yet').gray())
    return 1
  }
  var nowMs = Date.now()
  var sum = playtimeSummarize(doc, nowMs)
  if (sum.count === 0) {
    say(Text.of(target.name + ' has no playtime on record yet').gray())
    return 1
  }
  say(Text.of(doc.name || target.name).gold())
  say(Text.of('  ' + playtimeDuration(sum.totalMs) + ' across ' + sum.count + ' session' + (sum.count === 1 ? '' : 's')).gray())
  say(Text.of('  last seen ' + (sum.open ? 'right now' : playtimeStamp(sum.lastSeen))).gray())
  return 1
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  // `arguments` is a live identifier inside a normal function, so read it off the event as a
  // property instead of destructuring it into a local named arguments.
  const playtimeArgs = event.arguments

  event.register(
    Commands.literal('playtime')
      .executes(ctx => {
        try {
          return playtimeReport(ctx.source, null)
        } catch (e) {
          console.error('foundry: /playtime failed - ' + e)
          return 0
        }
      })
      .then(Commands.argument('player', playtimeArgs.WORD.create(event)).executes(ctx => {
        try {
          var name = String(playtimeArgs.WORD.getResult(ctx, 'player'))
          var who = playtimeResolve(ctx.source.server, name)
          if (!who) {
            if (ctx.source.player) ctx.source.player.tell(Text.of('never heard of ' + name).gray())
            return 0
          }
          return playtimeReport(ctx.source, who)
        } catch (e) {
          console.error('foundry: /playtime <player> failed - ' + e)
          return 0
        }
      }))
  )
})
