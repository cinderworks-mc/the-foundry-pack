// /rules /foundry /parked /bosses - short private answers in chat.
// (/parked was going to be /afk until the 09-02 live sweep found a pack mod
// already owns /afk as a toggle - never register over it.)
// same shape as foundry_commands.js: one commandRegistry block, one tell per line.
//
// 08-29: a NEW command name needs a full server RESTART, not /reload. brigadier's dispatcher
// is built once at startup and ServerEvents.commandRegistry is only walked then, so a /reload
// re-evaluates this file and registers nothing. batch it with anything else that needs a
// restart, and check for 0 players before pulling the trigger.
//
// 08-29: every top-level name in this file is prefixed `info`. kubejs server_scripts can share
// a rhino scope, and a bare `const RULES` here would fight anything a sibling script declares -
// same family of trap as the const/var scoping notes in foundry_first_join.js.
//
// the hearth's live wording came off the vanilla server 08-29, read-only, from fuji's command_toolbox
// rules module (config/fuji/modules/command_toolbox/rules/config.json):
//   - be kind. it is a fireplace, not a battlefield
//   - no griefing, no stealing, no surprises in other people's chests
//   - ask before you build right next to someone
//   - shared farms: take some, leave some, replant
//   - keep the fire going
// the foundry version below keeps the first two, drops "keep the fire going" (hearth's line,
// not this server's), and swaps in the two things a create server actually needs: give machines
// room, and aim your cannons somewhere nobody built.
//
// 08-30: no /discord command on purpose. everyone who can join is already in the discord
// (whitelist only), and there is no public invite to hand out.

const infoRules = [
  'be kind. it is a workshop, not a battlefield',
  'no griefing, no stealing, no surprises in other people\'s chests',
  'give people room. ask before you build up against someone',
  'point your tnt cannons at nothing anyone built'
]

const infoAbout = [
  'modded.cinderworks.dev. create is the backbone, ars nouveau is the magic,',
  'and the world is full of yung\'s dungeons to go poke at.',
  'the three trees do not need each other. pick whichever looks fun.',
  'chat is shared with the vanilla server and discord, so say hi.',
  'lost the guide book? /foundrybook'
]

const infoOnlinePath = 'kubejs/config/foundry_sessions/_online.json'
const infoEventsPath = 'kubejs/config/foundry_events/events.json'

function infoTellAfk(player) {
  try {
    var online = readDoc(infoOnlinePath)
    if (online.failed) {
      player.tell(Text.of('could not read who is around right now').gray())
      return
    }
    var players = online.doc && online.doc.players ? online.doc.players : []
    if (players.length === 0) {
      player.tell(Text.of('nobody is around right now').gray())
      return
    }
    var playing = []
    var parked = []
    players.forEach(entry => {
      if (!entry || !entry.uuid || !entry.name) return
      // an unreadable session is present rather than afk, matching the vote electorate:
      // unknown activity must not make somebody look parked.
      var session = readDoc(sessionPath(String(entry.uuid)))
      if (!session.failed && session.doc && lastOpenAfkIndex(session.doc) >= 0) {
        parked.push(String(entry.name))
      } else {
        playing.push(String(entry.name))
      }
    })
    player.tell(Text.of('who is around').gold())
    if (playing.length > 0) player.tell(Text.of('  playing: ' + playing.join(', ')).gray())
    if (parked.length > 0) player.tell(Text.of('  parked: ' + parked.join(', ')).gray())
  } catch (e) {
    console.error('foundry: /parked failed - ' + e)
    player.tell(Text.of('could not read who is around right now').gray())
  }
}

function infoBossName(id) {
  var raw = String(id || '')
  var colon = raw.indexOf(':')
  var name = colon >= 0 ? raw.substring(colon + 1) : raw
  return name.replace(/_/g, ' ')
}

function infoWhen(ms) {
  var date = new Date(Number(ms))
  if (isNaN(date.getTime())) return 'some time ago'
  var month = String(date.getMonth() + 1)
  var day = String(date.getDate())
  var hour = date.getHours()
  var minute = String(date.getMinutes())
  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day
  if (minute.length < 2) minute = '0' + minute
  return month + '-' + day + '-' + date.getFullYear() + ' ' + hour + ':' + minute
}

function infoTellBosses(player) {
  try {
    var ledger = readDoc(infoEventsPath)
    if (ledger.failed) {
      player.tell(Text.of('could not read the boss ledger right now').gray())
      return
    }
    var events = ledger.doc && ledger.doc.events ? ledger.doc.events : []
    var bosses = []
    var counts = {}
    events.forEach(entry => {
      if (!entry || entry.kind !== 'boss_kill') return
      bosses.push(entry)
      var name = String(entry.name || 'someone')
      counts[name] = (counts[name] || 0) + 1
    })
    if (bosses.length === 0) {
      player.tell(Text.of('no bosses felled yet. go make some history').gray())
      return
    }
    player.tell(Text.of('boss ledger').gold())
    var shown = 0
    var i = bosses.length - 1
    while (i >= 0 && shown < 2) {
      var boss = bosses[i]
      player.tell(Text.of('  ' + String(boss.name || 'someone') + ' felled ' + infoBossName(boss.detail) + ' on ' + infoWhen(boss.ms)).gray())
      shown = shown + 1
      i = i - 1
    }
    Object.keys(counts).sort().forEach(name => {
      player.tell(Text.of('  ' + name + ': ' + counts[name]).gray())
    })
  } catch (e) {
    console.error('foundry: /bosses failed - ' + e)
    player.tell(Text.of('could not read the boss ledger right now').gray())
  }
}

// tell the lines one at a time rather than joining with \n: Text.of() takes a plain string and
// a multi-line component renders the same either way, but one tell per line keeps each line
// its own chat entry, which is what the client's chat history and scrollback want.
function infoTellLines(player, header, lines) {
  player.tell(Text.of(header).gold())
  lines.forEach(line => player.tell(Text.of('  ' + line).gray()))
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  // 08-29: `var`, not `const`, for the locals inside the executes bodies - rhino hoists a const
  // declared inside a handler to the shared script scope, so the second run of the same body
  // throws "redeclaration of var". this is the bug that burned a core for six hours in
  // foundry_first_join.js on 08-29.
  const infoSimple = (name, header, lines) => event.register(
    Commands.literal(name).executes(ctx => {
      try {
        var p = ctx.source.player
        if (!p) return 0 // console or command block, nobody to tell
        infoTellLines(p, header, lines)
        return 1
      } catch (e) {
        console.error('foundry: /' + name + ' failed - ' + e)
        return 0
      }
    })
  )

  const infoPrivate = (name, tell) => event.register(
    Commands.literal(name).executes(ctx => {
      try {
        var p = ctx.source.player
        if (!p) return 0
        tell(p)
        return 1
      } catch (e) {
        console.error('foundry: /' + name + ' failed - ' + e)
        return 0
      }
    })
  )

  infoSimple('rules', 'house rules', infoRules)
  infoSimple('foundry', 'the foundry', infoAbout)
  infoPrivate('parked', infoTellAfk)
  infoPrivate('bosses', infoTellBosses)
})
