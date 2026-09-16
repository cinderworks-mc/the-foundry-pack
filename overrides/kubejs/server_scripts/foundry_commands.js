// /day /night /sun /storm - a vote, hearth-style (patrick's call, D21 of the 08-30 audit).
// the first draft ran them directly at permission level 4 with no check anywhere, so any
// one player could set time or weather for everyone. ops-only was the other option and it
// was rejected: on a four-friend server the point is that anybody can ask, not that one
// person decides.
//
// how it runs: someone types /day, everyone gets asked, a majority of the non-afk players
// online has 30 seconds to type yes in chat. alone on the server it just happens.
//
// afk comes from foundry_sessions.js's own afk spans (kubejs/config/foundry_sessions/
// <uuid>.json, an entry with end === null means afk right now) - that is the only afk
// signal on this server, essentialcommands ships no /afk and there is no afk detection in
// this build. a player whose file cannot be read counts as present, which can only ever
// make a vote harder to pass, never easier.
//
// rhino rules this file lives by (see reference_kubejs_rhino_gotchas): `var` for every
// local inside a handler, forEach instead of for-of, and the module-scope objects below are
// mutated and never rebound. runCommandSilent returns void, so nothing gates on its result.

const VOTE_WINDOW_TICKS = 600 // 30s at 20tps, and longer on a lagging server, which is fine
const VOTE_UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const VOTE_SESSION_DIR = 'kubejs/config/foundry_sessions'
const VOTE_YES = ['yes', 'y', 'yeah', 'yep', 'aye']

// the one live vote. a plain object that is mutated, never rebound - a rebind would put it
// on the shared script scope and the chat handler would stop seeing the same one.
const vote = {
  open: false,
  cmd: '',
  passMsg: '',
  endsAtTick: 0,
  needed: 0,
  yes: {},
  // the server reference is captured when the vote opens, from the command source. the
  // chat event carries no getServer() in this build (javap'd on KubePlayerEvent), and
  // reaching for a vanilla field on the player is the kind of thing that quietly stops
  // resolving after a remap - see the getStringUUID story in foundry_sessions.js.
  server: null,
}

function voteUuid(player) {
  try {
    return String(player.profile.id)
  } catch (e) {
    console.error('foundry: could not read a uuid for the vote - ' + e)
    return ''
  }
}

// true only when the session file says this player has an afk span open right now.
// anything unreadable returns false: an unknown player is a present player.
function voteIsAfk(uuid) {
  try {
    var el = JsonIO.readJson(VOTE_SESSION_DIR + '/' + uuid + '.json')
    if (el === null || el === undefined) return false
    var doc = JSON.parse(JsonIO.toPrettyString(el))
    if (!doc || !doc.afk) return false
    var i = doc.afk.length - 1
    while (i >= 0) {
      if (doc.afk[i] && doc.afk[i].end === null) return true
      i = i - 1
    }
    return false
  } catch (e) {
    return false
  }
}

// everyone online who is not afk, as { uuid, name }. this is the electorate, sampled once
// when the vote opens - a player who joins mid-vote does not change the bar.
function voteElectorate(server) {
  var out = []
  try {
    server.players.forEach(player => {
      var uuid = voteUuid(player)
      if (!VOTE_UUID_RE.test(uuid)) return
      if (voteIsAfk(uuid)) return
      out.push({ uuid: uuid, name: player.username })
    })
  } catch (e) {
    console.error('foundry: could not build the vote electorate - ' + e)
  }
  return out
}

function voteReset() {
  vote.open = false
  vote.cmd = ''
  vote.passMsg = ''
  vote.endsAtTick = 0
  vote.server = null
  vote.needed = 0
  vote.yes = {}
}

function voteCount() {
  return Object.keys(vote.yes).length
}

function votePass(server) {
  var cmd = vote.cmd
  var msg = vote.passMsg
  voteReset()
  server.runCommandSilent(cmd)
  server.tell(Text.of(msg).gold())
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  const voted = (name, cmd, ask, passMsg) => event.register(
    Commands.literal(name).executes(ctx => {
      var server = ctx.source.server
      var player = null
      try {
        player = ctx.source.player
      } catch (e) {
        player = null
      }

      // the console (or anything without a player) is not voting with itself
      if (!player) {
        server.runCommandSilent(cmd)
        server.tell(Text.of(passMsg).gold())
        return 1
      }

      if (vote.open) {
        player.tell(Text.of('there is already a vote running. type yes').gray())
        return 1
      }

      var who = player.username
      var voters = voteElectorate(server)
      if (voters.length <= 1) {
        // alone, or everyone else is afk. no one to ask.
        server.runCommandSilent(cmd)
        server.tell(Text.of(passMsg).gold())
        return 1
      }

      vote.open = true
      vote.cmd = cmd
      vote.passMsg = passMsg
      vote.server = server
      vote.endsAtTick = server.tickCount + VOTE_WINDOW_TICKS
      vote.needed = Math.floor(voters.length / 2) + 1
      vote.yes = {}
      var starter = voteUuid(player)
      if (VOTE_UUID_RE.test(starter)) vote.yes[starter] = true

      server.tell(Text.of(who + ' wants ' + ask + '. type yes in chat within 30s').gold())
      server.tell(Text.of('   ' + voteCount() + '/' + vote.needed + ' so far').gray())

      // one player asking with everyone else afk cannot happen here (voters > 1), but a
      // needed of 1 still can if the maths ever changes, so pass immediately rather than
      // sitting on an already-won vote.
      if (voteCount() >= vote.needed) votePass(server)
      return 1
    })
  )

  voted('day', 'time set day', 'it to be day', 'the sun comes up')
  voted('night', 'time set night', 'it to be night', 'the sun goes down')
  voted('sun', 'weather clear', 'the sky clear', 'the sky clears')
  voted('storm', 'weather thunder', 'a storm', 'a storm rolls in')
})

// yes votes come out of normal chat, and the message is never cancelled - the line still
// shows up like anything else anyone types.
//
// 09-01: this used to read event.rawText, which does not exist on
// PlayerChatReceivedKubeEvent (javap'd the pinned kubejs-neoforge-2101.7.2-build.374.jar:
// the class has getMessage() and getComponent(), no getRawText()). rhino does not throw on
// a missing bean property, it hands back undefined, so String(event.rawText) silently
// evaluated to the literal string "undefined" every time - never matched a yes word, never
// hit the catch, never logged anything. that is the actual bug patrick hit: a second player
// typing yes was accepted by chat like any other message and then quietly ignored by this
// handler. event.message (getMessage(), a plain String) is the real field.
PlayerEvents.chat(event => {
  try {
    if (!vote.open) return
    var text = String(event.message)
    var word = text.trim().toLowerCase()
    if (VOTE_YES.indexOf(word) < 0) return

    var player = event.player
    var uuid = voteUuid(player)
    if (!VOTE_UUID_RE.test(uuid)) return
    if (vote.yes[uuid]) return
    vote.yes[uuid] = true

    var server = vote.server
    if (!server) return
    if (voteCount() >= vote.needed) {
      votePass(server)
      return
    }
    server.tell(Text.of('   ' + voteCount() + '/' + vote.needed + ' so far').gray())
  } catch (e) {
    console.error('foundry: vote chat handler failed - ' + e)
  }
})

// the only tick handler in this file, and the guard is the first line: an open vote is one
// property lookup per tick and nothing else.
ServerEvents.tick(event => {
  if (!vote.open) return
  if (event.server.tickCount < vote.endsAtTick) return
  voteReset()
  event.server.tell(Text.of('not enough yeses, leaving it as it is').gray())
})
