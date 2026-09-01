// per-player session log. phase 0 of the playtime tracker (plan decision 1 = option A:
// an in-process kubejs hook, not a log tail and not the calcifer relay). one file per
// player at kubejs/config/foundry_sessions/<uuid>.json, plus a one-time _meta.json
// holding the era anchor (decision 6: the heatmap spans forever, the era marker is what
// lets a world rebuild be drawn as a boundary instead of read as a reset).
//
// why that dir: kubejs/ is not nix-managed, foundry-deploy.sh rsyncs overrides/ with no
// --delete, and this repo ships no overrides/kubejs/config/ - so a deploy and a nixos
// switch both leave it alone. it also survives a world rebuild, which anything under
// foundry/<world>/ would not, and the world is still a first draft.
//
// on-disk shape, every timestamp epoch ms and UTC by definition:
//   { "uuid": "9ff1c2c7-...",
//     "name": "patrickhere",
//     "names": [ { "name": "patrickhere", "seen": 1756503195186 } ],
//     "sessions": [ { "start": 1756503195186, "end": 1756503235061 },
//                   { "start": 1756503300000, "end": null } ],
//     "afk": [ { "start": 1756503360000, "end": 1756503660000 },
//              { "start": 1756503720000, "end": null } ] }
//
// end === null means the session is open: the player is on right now, or the server died
// without closing it. this script never invents an end it did not observe, so an orphaned
// open session stays open and the generator decides what to do with it. the accepted cost
// of option A is that a SIGKILL loses one session per player who was online.
//
// AFK. the `afk` array is a second, sparser list of spans in exactly the same shape and
// the same units, and every span sits inside one of the sessions above. it is written by
// the 60s heartbeat at the bottom of this file, not by an event: each heartbeat samples
// every online player's position and rotation, and a player whose sample has not changed
// for 5 consecutive heartbeats (5 minutes) is afk from the first sample that carried the
// unchanged value. the span is appended with end === null on that transition and closed on
// the next heartbeat that sees a different sample, on logout, and on server unload - so an
// afk span never outlives the session it sits in unless the server was SIGKILLed, which is
// the same accepted cost as an open session.
//
// both ends of an afk span are therefore quantized to the heartbeat: the true start is at
// most 60s earlier and the true end at most 60s earlier than what is written. that is the
// honest resolution of a once-a-minute sampler and it is not smoothed over here.
//
// the key is ABSENT, not empty, on a server that never sampled a pose - see readPose. the
// generator keys "does this server have an afk signal at all" off the key existing, so a
// build with no pose accessor renders exactly as it did before this was added.
//
// there is also one presence file, kubejs/config/foundry_sessions/_online.json:
//   { "ts": 1756503195186, "players": [ { "uuid": "9ff1c2c7-...", "name": "patrickhere" } ] }
// it is a snapshot, not a log, and it is always safe to overwrite. the site needs "who is
// on right now" without having to decide whether an end === null session is a live player
// or a crash orphan, and ts is what makes that call: a ts older than a couple of minutes
// means the server is not running and the list is stale, no matter what it says.
//
// 08-29: exactly one ServerEvents.tick in this file, and it stays that way. the heartbeat
// below is the only reason a tick handler is allowed here at all - joins and leaves are
// still where the real work happens.

const SESSION_DIR = 'kubejs/config/foundry_sessions'
const META_PATH = SESSION_DIR + '/_meta.json'
const ONLINE_PATH = SESSION_DIR + '/_online.json'
const ERA_ID = 'foundry-draft-1'
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

// how many consecutive unchanged heartbeat samples make a player afk. the heartbeat is
// 1200 ticks, so 5 of them is 5 minutes on a healthy server and longer on a lagging one -
// which is the right direction: a server too slow to tick is not one where somebody is
// quietly playing.
const AFK_SAMPLES = 5

// module-scope state, keyed by uuid: { name, start }. this is the flush list for
// ServerEvents.unloaded and the fallback join time if the write on join failed.
// 08-29: both of these are plain objects that get mutated, never rebound. rhino puts a
// const on the shared script scope (see the for-of note in foundry_first_join.js), so
// anything that changes lives as a property, not as a reassigned binding.
const openJoins = {}
const state = { metaChecked: false, poseReader: null }

// the afk sampler's memory, keyed by uuid:
//   { pose: '<quantized x|y|z|yaw|pitch>', sinceMs, samples, afk }
// sinceMs is when this pose was FIRST seen, samples is how many heartbeats since have seen
// the same one, and afk says whether a span is currently open on disk for it. same rules as
// openJoins: a plain object that is mutated, never rebound.
const afkSample = {}

function sessionPath(uuid) {
  return SESSION_DIR + '/' + uuid + '.json'
}

// 08-29: NOT the vanilla-uuid bean property. there is no kjs$ accessor for a uuid
// (javap on EntityKJS and PlayerKJS in the pinned jar: kjs$getUsername yes, nothing for
// the uuid), so this is net.minecraft.world.entity.Entity.getStringUUID(), which is the
// real runtime name because neoforge 1.21 runs on official mappings. getUUID() is the
// backstop in case rhino resolves the overload differently than expected.
// 08-29 live test: neither getStringUUID() nor getUUID() resolves on a ServerPlayer in
// this build ("Cannot find function getUUID"), the remapper hides the vanilla names. what
// IS there is kjs$getProfile() on EntityKJS/PlayerKJS (javap'd), so `player.profile` is a
// GameProfile and `.id` is its java.util.UUID. `player.uuid` is the bean-name backstop.
function playerUuid(player) {
  try {
    return String(player.profile.id)
  } catch (e) {
    console.error('foundry: player.profile.id failed, trying player.uuid - ' + e)
  }
  try {
    return String(player.uuid)
  } catch (e2) {
    console.error('foundry: could not read a uuid off a player - ' + e2)
  }
  return ''
}

// 08-29: hand JsonIO.write a JsonElement parsed from our own json text instead of the
// raw js object. the js -> json type wrapper is JsonUtils.of(), which turns a rhino
// number into new JsonPrimitive((Number) Double), and gson prints Double.toString() - so
// an epoch ms would land on disk as 1.756503195186E12. that is legal json and it parses
// back to the exact same integer, but it reads like a bug and it is a nasty thing to
// hand a downstream parser. JsonIO.parseRaw keeps gson's LazilyParsedNumber, which
// prints the literal it was parsed from. all javap'd on the pinned jar.
function toJsonElement(doc) {
  // rhino registers NativeJSON from Context.initStandardObjects, so this branch should
  // never fire. if it does, the data is still correct, just exponent-formatted.
  if (typeof JSON === 'undefined') return doc
  return JsonIO.parseRaw(JSON.stringify(doc))
}

// returns { doc, failed }. a missing file is doc null / failed false. anything that
// throws is failed true, and every caller then refuses to write - so a corrupt or
// unreadable file is never quietly replaced with a fresh empty one.
//
// 08-29: this is JsonIO.readJson, NOT JsonIO.read. javap on the pinned jar shows
// read(cx, path) ending in Context.optionalMapOf(readJson(path)), and Context.isMapLike()
// returns true only for a NativeJavaMap or a java.util.Map. a gson JsonObject is neither,
// so optionalMapOf hands back null for every real json file and JsonIO.read cannot read
// anything. readJson is the one that works: it returns null when the file is missing
// (Files.notExists check, no throw) and only throws when the json itself is bad, which is
// exactly the missing-vs-corrupt split this needs. read out of bytecode, not tested live.
// toPrettyString rather than JsonIO.toString because a static named toString on a java
// class object is asking for a collision with Object.toString in rhino.
function readDoc(path) {
  try {
    var el = JsonIO.readJson(path)
    if (el === null || el === undefined) return { doc: null, failed: false }
    return { doc: JSON.parse(JsonIO.toPrettyString(el)), failed: false }
  } catch (e) {
    console.error('foundry: could not read ' + path + ', leaving it alone - ' + e)
    return { doc: null, failed: true }
  }
}

// 08-29: there is no rename or move primitive inside the kubejs sandbox. JsonIO has
// read / readJson / readString / write and nothing else, and KubeJSPaths has no move or
// copy (javap'd both). java.nio.file.Files.move via Java.loadClass() would work, but it
// skips KubeJSPaths.verifyFilePath(), which is the one guard keeping a script inside the
// server dir - not worth trading for four players' worth of writes. so this writes in
// place. JsonIO.write is Files.writeString: truncate, then write. a crash in that window
// costs that player's file, which is the documented lose of option A.
function writeDoc(path, doc) {
  // JsonIO.write(path, null) DELETES the file - the first thing its bytecode does is
  // Files.deleteIfExists on a null or JsonNull element. never let an empty doc reach it.
  if (!doc || !doc.uuid || !doc.sessions) {
    console.error('foundry: refusing to write a doc with no uuid or sessions to ' + path)
    return
  }
  try {
    JsonIO.write(path, toJsonElement(doc))
  } catch (e) {
    console.error('foundry: write failed for ' + path + ' - ' + e)
  }
}

// the presence snapshot. unlike a session file this is never read back and never merged,
// so there is no readDoc guard here - it is a full overwrite every time, and losing it to
// a crash costs nothing because the next heartbeat rewrites it.
//
// 08-29: an empty players list is fine to write, a null doc is not. JsonIO.write deletes
// the file when the element is null or JsonNull (see writeDoc), and a deleted _online.json
// is indistinguishable from "the tracker was never installed" on the reading end, whereas
// { players: [] } says "nobody is on" out loud. so the doc is always built here, never
// passed in as something that could be null.
function putPresence(nowMs, players) {
  try {
    JsonIO.write(ONLINE_PATH, toJsonElement({ ts: nowMs, players: players }))
  } catch (e) {
    console.error('foundry: presence write failed for ' + ONLINE_PATH + ' - ' + e)
  }
}

// build the list from openJoins, which is the same map loggedIn/loggedOut maintain, so
// presence and the session files can never disagree about who is on.
function writePresence(nowMs) {
  try {
    var players = []
    // 08-29: forEach, not for-of - same rhino scoping trap as the flush loop below.
    Object.keys(openJoins).forEach(uuid => {
      var open = openJoins[uuid]
      if (open) players.push({ uuid: uuid, name: open.name })
    })
    putPresence(nowMs, players)
  } catch (e) {
    console.error('foundry: could not build the presence list - ' + e)
  }
}

function writeEmptyPresence(nowMs) {
  putPresence(nowMs, [])
}

// rebuild openJoins from who is actually online. this is the /reload repair: a reload
// re-evaluates this script, openJoins comes back empty, and without this every online
// player silently drops out of presence. an empty presence file is worse than no presence
// file, because the generator reads a live end === null session as a crash orphan and caps
// it at the presence ts - so a reload would quietly truncate everyone's current session.
//
// nothing here is invented. a start is either the one already on disk, or now - and "now"
// is only used when the player is observably online this instant with no open session to
// inherit, which is an observed fact, not a guess. it can undercount a session that a
// missing file lost the front of; it can never fabricate time nobody played.
//
// returns how many players it seeded, so the caller can log a reload repair but stay quiet
// on the 1439 heartbeats a day where there is nothing to do.
function reseedFromOnline(server, nowMs) {
  var added = 0
  try {
    // .forEach on server.players: it is a java list adapted to a js array-like, and
    // foundry_first_join.js already calls .find(p => ...) on this exact object live.
    server.players.forEach(player => {
      var uuid = playerUuid(player)
      if (!UUID_RE.test(uuid)) return
      if (openJoins[uuid]) return // already tracked, leave the real join time alone
      var name = player.username
      var read = readDoc(sessionPath(uuid))
      if (read.failed) {
        // corrupt file: seed anyway so presence is right. every write path re-reads and
        // refuses on failure, so this cannot make the session file any worse.
        console.error('foundry: ' + name + ' is online but their session file is unreadable, presence only')
        openJoins[uuid] = { name: name, start: nowMs }
        added = added + 1
        return
      }
      // 08-30: a /reload wipes afkSample as well as openJoins. without this, a player who
      // was already afk would have their 5 samples counted again from scratch and openAfk
      // would try to append a SECOND open span on top of the one already on disk. seed the
      // counter as already-afk instead, anchored to the span that is on disk and to the
      // pose they are holding right now, so the next real movement closes it normally.
      // a player who moved DURING the reload gap keeps the span open until they move
      // again - a bounded overcount on a rare event, and the alternative (closing at now)
      // would be writing an end nobody observed.
      var a = read.doc ? lastOpenAfkIndex(read.doc) : -1
      if (a >= 0 && !afkSample[uuid]) {
        var pose = readPose(player)
        if (pose) {
          afkSample[uuid] = { pose: pose, sinceMs: read.doc.afk[a].start, samples: AFK_SAMPLES, afk: true }
        }
      }
      var i = read.doc && read.doc.sessions ? lastOpenIndex(read.doc) : -1
      if (i >= 0) {
        // inherit the open session written on their real join. this is the whole point:
        // the reload is invisible, the session keeps its true start.
        openJoins[uuid] = { name: name, start: read.doc.sessions[i].start }
      } else {
        // no open session to inherit, but they are on the server right now, so open one.
        ensureMeta(nowMs)
        openSession(uuid, name, nowMs)
        openJoins[uuid] = { name: name, start: nowMs }
      }
      added = added + 1
    })
  } catch (e) {
    console.error('foundry: could not reseed open sessions from the online list - ' + e)
  }
  return added
}

// the era anchor, written once and never rewritten. a rebuilt world resets vanilla
// play_time for everyone; these json files survive it, so the era list is what tells the
// generator where to draw the boundary.
function ensureMeta(nowMs) {
  if (state.metaChecked) return
  state.metaChecked = true // set before the write: a failure must not retry on every join
  var read = readDoc(META_PATH)
  if (read.failed) return
  if (read.doc && read.doc.era) return
  try {
    JsonIO.write(META_PATH, toJsonElement({ era: [{ id: ERA_ID, start: nowMs }] }))
  } catch (e) {
    console.error('foundry: could not write the era marker to ' + META_PATH + ' - ' + e)
  }
}

// a name change keeps the uuid, so the uuid is the identity and the name is just the
// latest label. names[] is append-only, oldest first, so the site can show what someone
// used to be called.
function noteName(doc, name, nowMs) {
  if (!name) return
  doc.name = name
  if (!doc.names) doc.names = []
  var last = doc.names.length > 0 ? doc.names[doc.names.length - 1] : null
  if (last && last.name === name) return
  doc.names.push({ name: name, seen: nowMs })
}

function lastOpenIndex(doc) {
  var i = doc.sessions.length - 1
  while (i >= 0) {
    if (doc.sessions[i] && doc.sessions[i].end === null) return i
    i = i - 1
  }
  return -1
}

// ---------------------------------------------------------------- afk sampling
//
// 08-30: there is NO kjs$ accessor for position or rotation on this build. javap on
// dev.latvian.mods.kubejs.core.EntityKJS in the pinned jar lists kjs$setX / kjs$setY /
// kjs$setZ, kjs$setPosition, kjs$setPositionAndRotation, kjs$setRotation and
// kjs$getMotionX/Y/Z - every coordinate READER is a setter or a velocity, and the same is
// true of LivingEntityKJS, PlayerKJS and ServerPlayerKJS. the only kjs$ position-shaped
// getters are kjs$getBlock() (a LevelBlock, so integer block coords) and kjs$getFacing()
// (one of six Directions), and neither is fine-grained enough to tell "standing still"
// from "turning in place at a mob farm".
//
// so the readers below are the vanilla members of net.minecraft.world.entity.Entity, which
// do exist under those names at runtime: neoforge 21.1.248 ships the server on official
// mappings, and javap on
// libraries/net/minecraft/server/1.21.1-20240808.144430/server-...-srg.jar shows
// `public final double getX()`, `getY()`, `getZ()`, `public float getYRot()`,
// `public float getXRot()`, `public net.minecraft.world.phys.Vec3 position()` and the
// public previous-tick fields `yRotO` / `xRotO`. yRot and xRot themselves are PRIVATE,
// so there is no direct field read for the live rotation.
//
// they are still probed rather than trusted, because getStringUUID() is on that same class
// under that same mapping and did not resolve live on 08-29 (see playerUuid). the probe
// runs once per script evaluation, keeps the first reader that produces five finite
// numbers, and if none does it turns afk sampling off for good and says so - no afk key is
// then written and the site renders the foundry exactly as it did before.
//
// rhino bean naming, out of the JavaMembers bytecode: a `getFoo` becomes `foo`, but the
// first letter is only lowercased when the SECOND one is not also uppercase. so getX ->
// `x`, getYRot -> `YRot` (not `yRot`), getXRot -> `XRot`. that is why the bean reader
// looks inconsistent - it is not a typo.
const POSE_READERS = [
  { id: 'beans', read: p => [p.x, p.y, p.z, p.YRot, p.XRot] },
  { id: 'methods', read: p => [p.getX(), p.getY(), p.getZ(), p.getYRot(), p.getXRot()] },
  { id: 'vec3+prev-rot', read: p => { var v = p.position(); return [v.x, v.y, v.z, p.yRotO, p.xRotO] } },
]

// five numbers -> one comparable string, or '' if any of them is not a finite number.
// position is quantized to 1cm and rotation to a tenth of a degree: tight enough that a
// single step or a nudge of the mouse registers, loose enough that bobbing in water or
// riding a boat on still liquid does not read as playing.
function poseKey(nums) {
  if (!nums || nums.length !== 5) return ''
  var out = ''
  var i = 0
  while (i < 5) {
    var v = Number(nums[i])
    if (isNaN(v) || !isFinite(v)) return ''
    var q = i < 3 ? Math.round(v * 100) / 100 : Math.round(v * 10) / 10
    out = out + (i > 0 ? '|' : '') + q
    i = i + 1
  }
  return out
}

function readPose(player) {
  if (state.poseReader === 'none') return ''
  if (state.poseReader) {
    try {
      return poseKey(state.poseReader.read(player))
    } catch (e) {
      console.error('foundry: pose reader "' + state.poseReader.id + '" stopped resolving, afk sampling off - ' + e)
      state.poseReader = 'none'
      return ''
    }
  }
  var i = 0
  while (i < POSE_READERS.length) {
    var r = POSE_READERS[i]
    try {
      var key = poseKey(r.read(player))
      if (key) {
        state.poseReader = r
        console.info('foundry: afk sampling with the "' + r.id + '" pose reader')
        return key
      }
      console.warn('foundry: pose reader "' + r.id + '" resolved but did not return five finite numbers')
    } catch (e2) {
      console.warn('foundry: pose reader "' + r.id + '" did not resolve - ' + e2)
    }
    i = i + 1
  }
  state.poseReader = 'none'
  console.error('foundry: no position/rotation accessor resolved on this build, afk is NOT being sampled. sessions are unaffected and no afk key is written.')
  return ''
}

function lastOpenAfkIndex(doc) {
  if (!doc || !doc.afk) return -1
  var i = doc.afk.length - 1
  while (i >= 0) {
    if (doc.afk[i] && doc.afk[i].end === null) return i
    i = i - 1
  }
  return -1
}

// close whatever afk span is open on this doc, in place. returns whether it changed
// anything, so a caller that is not already writing can skip the write. a close that would
// land at or before the start is a torn or clock-skewed write rather than an interval, and
// the span is dropped instead of stored inside out.
function closeAfkOnDoc(doc, endMs) {
  var i = lastOpenAfkIndex(doc)
  if (i < 0) return false
  if (!(endMs > doc.afk[i].start)) {
    console.warn('foundry: dropping an afk span that would close at or before its start (' + doc.afk[i].start + ' -> ' + endMs + ')')
    doc.afk.splice(i, 1)
    return true
  }
  doc.afk[i].end = endMs
  return true
}

// the transition INTO afk. the start is sinceMs, the heartbeat that first saw this pose -
// not the one 5 minutes later that proved it had not changed, which would silently shave 5
// minutes off every afk span.
function openAfk(uuid, name, sinceMs) {
  var path = sessionPath(uuid)
  var read = readDoc(path)
  if (read.failed) return
  var doc = read.doc
  if (!doc || !doc.sessions) {
    console.error('foundry: no session file to record afk in for ' + name)
    return
  }
  doc.uuid = uuid
  if (!doc.afk) doc.afk = []
  if (lastOpenAfkIndex(doc) >= 0) {
    console.warn('foundry: ' + name + ' already has an open afk span on disk, not opening a second one')
    return
  }
  doc.afk.push({ start: sinceMs, end: null })
  writeDoc(path, doc)
}

// the transition OUT of afk on movement. logout and server unload do NOT come through
// here - they close the span inside closeSession's own read-modify-write, so the session
// end and the afk end are one write and can never disagree.
function closeAfk(uuid, name, nowMs, why) {
  var path = sessionPath(uuid)
  var read = readDoc(path)
  if (read.failed) return
  var doc = read.doc
  if (!doc || !doc.sessions) {
    console.error('foundry: no session file to close an afk span in for ' + name + ' (' + why + ')')
    return
  }
  doc.uuid = uuid
  if (closeAfkOnDoc(doc, nowMs)) writeDoc(path, doc)
}

// one pass over the online players, once a minute, from the heartbeat. writes nothing on
// the overwhelming majority of passes: only a transition in or out of afk touches disk.
function sampleAfk(server, nowMs) {
  try {
    // forEach, not for-of - same rhino scoping trap as every other loop in this file.
    server.players.forEach(player => {
      var uuid = playerUuid(player)
      if (!UUID_RE.test(uuid)) return
      var pose = readPose(player)
      if (!pose) return // no accessor on this build, or this player did not read cleanly
      var name = player.username
      var prev = afkSample[uuid]
      if (!prev || prev.pose !== pose) {
        // they moved, or this is their first sample. either way a fresh run starts here.
        if (prev && prev.afk) closeAfk(uuid, name, nowMs, 'moved')
        afkSample[uuid] = { pose: pose, sinceMs: nowMs, samples: 0, afk: false }
        return
      }
      prev.samples = prev.samples + 1
      if (!prev.afk && prev.samples >= AFK_SAMPLES) {
        prev.afk = true
        openAfk(uuid, name, prev.sinceMs)
      }
    })
  } catch (e) {
    console.error('foundry: afk sampling failed - ' + e)
  }
}

// the open session is written on join, not held only in memory. server_scripts are
// re-evaluated on /reload and the deploy procedure is "rsync, then /reload", so a
// memory-only join time is guaranteed to be dropped on someone eventually. on disk it
// survives the reload and the leave still closes it correctly.
function openSession(uuid, name, nowMs) {
  var path = sessionPath(uuid)
  var read = readDoc(path)
  if (read.failed) return
  var doc = read.doc || { uuid: uuid, name: name, names: [], sessions: [] }
  doc.uuid = uuid
  if (!doc.sessions) doc.sessions = []
  noteName(doc, name, nowMs)
  var stale = lastOpenIndex(doc)
  if (stale >= 0) {
    console.warn('foundry: ' + name + ' had an unclosed session from ' + doc.sessions[stale].start + ', leaving it open')
  }
  // 08-30: an afk span can be left open by the same SIGKILL that leaves a session open, and
  // an afk span must never outlive its session. if the session it sits in DID get closed,
  // that end is an observed bound and the span closes there. if that session is open too,
  // there is no observed bound to use and both stay open - the generator already clips afk
  // to whatever end it settles on for the session, so the pair stays consistent.
  var danglingAfk = lastOpenAfkIndex(doc)
  if (danglingAfk >= 0) {
    var span = doc.afk[danglingAfk]
    var host = null
    var j = doc.sessions.length - 1
    while (j >= 0) {
      var s = doc.sessions[j]
      if (s && s.end !== null && s.start <= span.start && s.end >= span.start) { host = s; break }
      j = j - 1
    }
    if (host) {
      closeAfkOnDoc(doc, host.end)
      console.warn('foundry: closed a dangling afk span for ' + name + ' at the end of the session it sits in (' + host.end + ')')
    } else {
      console.warn('foundry: ' + name + ' has an afk span open from ' + span.start + ' inside a session that never closed, leaving it open')
    }
  }
  doc.sessions.push({ start: nowMs, end: null })
  writeDoc(path, doc)
}

function closeSession(uuid, name, nowMs, why) {
  var path = sessionPath(uuid)
  var read = readDoc(path)
  if (read.failed) return
  var doc = read.doc
  if (!doc || !doc.sessions) {
    console.error('foundry: no session file to close for ' + name + ' (' + why + ')')
    return
  }
  doc.uuid = uuid
  noteName(doc, name, nowMs)
  var i = lastOpenIndex(doc)
  if (i >= 0) {
    doc.sessions[i].end = nowMs
  } else {
    // nothing open on disk, so the write on join failed. fall back to the in-memory join
    // time, and record nothing at all if that is gone too - a start nobody observed is
    // not a start, and a guessed one is worse than a missing one.
    var open = openJoins[uuid]
    if (!open) {
      console.error('foundry: ' + name + ' left (' + why + ') with no open session on disk and no join time in memory, nothing recorded')
      return
    }
    doc.sessions.push({ start: open.start, end: nowMs })
  }
  // the session is ending, so any open afk span ends with it - same write, so the two can
  // never disagree about where the session stopped. this is the "close on leave" half of
  // the rule that an afk span never outlives its session.
  closeAfkOnDoc(doc, nowMs)
  writeDoc(path, doc)
}

// 08-29: `var`, not `const`, for the locals inside these handlers. live test showed rhino
// hoisting a `const` declared inside a try block to the shared script scope, so the
// loggedIn and loggedOut handlers both declaring `const player` threw "redeclaration of
// var player" on every join and leave. same family as the for-of bug in
// foundry_first_join.js; function-local `var` is the one thing rhino scopes correctly.
PlayerEvents.loggedIn(event => {
  try {
    var player = event.player
    var uuid = playerUuid(player)
    var name = player.username
    if (!UUID_RE.test(uuid)) {
      console.error('foundry: not logging a session for ' + name + ', bad uuid "' + uuid + '"')
      return
    }
    var nowMs = Date.now()
    openJoins[uuid] = { name: name, start: nowMs }
    // a new session starts with no afk history. anything left in the map is from the
    // session that just ended (or from before a crash) and must not carry over.
    delete afkSample[uuid]
    ensureMeta(nowMs)
    openSession(uuid, name, nowMs)
    // 08-29: reseed here too, or a join inside the reload gap writes a presence file
    // listing ONLY the joiner and drops everyone who was already on - the same truncation
    // bug as an empty file, just aimed at fewer people. costs nothing on a normal join:
    // everyone online is already in openJoins by now, so it is one map lookup each and no
    // reads. it only touches disk when there is actually something to repair.
    reseedFromOnline(event.server, nowMs)
    // presence goes last, after the session write, so the file that says "on right now"
    // is never ahead of the file the site actually counts hours from.
    writePresence(nowMs)
  } catch (e) {
    // never throw into the event. a broken session log must not break joining.
    console.error('foundry: session log failed on join - ' + e)
  }
})

PlayerEvents.loggedOut(event => {
  try {
    var player = event.player
    var uuid = playerUuid(player)
    var name = player.username
    if (!UUID_RE.test(uuid)) {
      console.error('foundry: not closing a session for ' + name + ', bad uuid "' + uuid + '"')
      return
    }
    var nowMs = Date.now()
    // closeSession closes the open afk span too, in the same write as the session end.
    closeSession(uuid, name, nowMs, 'logout')
    delete openJoins[uuid]
    delete afkSample[uuid]
    writePresence(nowMs) // after the delete, so the leaver is already out of the list
  } catch (e) {
    console.error('foundry: session log failed on leave - ' + e)
  }
})

// close whatever is still open when the server unloads. a clean /stop disconnects
// players first, so loggedOut normally fires for everyone and this finds nothing - it is
// here for the cases where it does not. a SIGKILL still loses the open session; that is
// the accepted cost, and the vanilla play_time drift check on the site is what catches it.
ServerEvents.unloaded(event => {
  var nowMs = Date.now()
  try {
    var uuids = Object.keys(openJoins)
    if (uuids.length > 0) {
      // 08-29: forEach, not for-of. rhino does not give a for-of body a fresh scope per
      // pass - it puts the body's const on the shared script scope via
      // ScriptableObject.putConstProperty, which threw "TypeError: redeclaration of var
      // player" once a second forever in foundry_first_join.js. a function body is a real
      // scope, so the const is fresh every pass.
      uuids.forEach(uuid => {
        var open = openJoins[uuid]
        closeSession(uuid, open.name, nowMs, 'server unload')
        delete openJoins[uuid]
        delete afkSample[uuid]
      })
      console.info('foundry: flushed ' + uuids.length + ' open session(s) on server unload')
    }
  } catch (e) {
    console.error('foundry: session flush failed on server unload - ' + e)
  }
  // outside the try on purpose: a flush that threw halfway is exactly when a stale
  // _online.json would be most wrong, so the clear has to happen either way.
  writeEmptyPresence(nowMs)
})

// 08-29: ServerEvents.LOADED exists in this build, but it is NOT a reload hook. javap -c
// on dev.latvian.mods.kubejs.server.KubeJSServerEventHandler in the pinned jar shows
// ServerEvents.LOADED posted from exactly one place, serverStarting(ServerStartingEvent),
// and ServerScriptManager.reload() never posts it. two consequences, both load-bearing:
//   1. it does not fire on /reload, so it cannot be where the reload repair lives.
//   2. ServerStartingEvent is before the server accepts connections, so server.players is
//      always empty here and the reseed below is always a no-op on a real boot.
// it is still called rather than hardcoding an empty write, because a no-op reseed
// followed by writePresence produces the empty file honestly - derived from the online
// list rather than assumed - and if neoforge ever moves this hook later in startup it
// starts doing real work with no edit. that is also why a fresh boot clears stale state:
// nobody is on at ServerStartingEvent, so the file correctly says nobody is on.
ServerEvents.loaded(event => {
  var nowMs = Date.now()
  reseedFromOnline(event.server, nowMs)
  writePresence(nowMs)
})

// the heartbeat, and the only ServerEvents.tick in this file. the guard is the first line
// and 1200 is a literal, not a const, so 1199 ticks out of every 1200 cost one modulo and
// a return - no scope lookup, no map walk, no Date.now(), no allocation. 1200 ticks is 60s
// at 20 tps, and it drifts long when the server lags, which is correct: a lagging server
// should look staler. without this the presence file has no freshness signal at all - a
// reader cannot tell "3 players on" from "3 players were on when the box died".
//
// 08-29: the reseed runs here, not just in loaded, and this is the only handler that can
// do the job. /reload wipes openJoins and fires no lifecycle event this script can see, so
// the heartbeat is the one thing that runs afterwards holding a live server reference.
// without the reseed on this line the heartbeat is actively harmful after a reload: it
// would overwrite a correct presence file with an empty one within 60s. it costs one map
// lookup per online player per minute once everyone is seeded.
//
// 08-30: the afk sampler rides the SAME heartbeat rather than adding a second tick handler.
// that is not just tidiness - two handlers would each pay the modulo on every one of the
// 1200 ticks, and the sampler needs the reseed to have run first so a post-reload player is
// already carrying their on-disk afk state before their pose is compared. it writes nothing
// on a pass where nobody crossed the 5-sample line, so a quiet minute is still one map
// lookup and one presence write.
ServerEvents.tick(event => {
  if (event.server.tickCount % 1200 !== 0) return
  var nowMs = Date.now()
  var added = reseedFromOnline(event.server, nowMs)
  if (added > 0) {
    console.info('foundry: reseeded ' + added + ' open session(s) from the online list, probably after a /reload')
  }
  sampleAfk(event.server, nowMs)
  // presence goes last, after both the session and afk writes, for the same reason as on
  // join: the file that says "on right now" is never ahead of the files the site counts.
  writePresence(nowMs)
})
