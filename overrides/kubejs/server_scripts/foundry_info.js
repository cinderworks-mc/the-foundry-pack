// /rules /foundry - the two things every new player asks about, answered in chat.
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
// RULES TEXT - NEEDS PATRICK'S STRIKE-PASS. these four lines are a rewrite, not his words.
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
  'modded.hartforge.dev. create is the backbone, ars nouveau is the magic,',
  'and the world is full of yung\'s dungeons to go poke at.',
  'the three trees do not need each other. pick whichever looks fun.',
  'chat is shared with the vanilla server and discord, so say hi.',
  'lost the guide book? /foundrybook'
]

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

  infoSimple('rules', 'house rules', infoRules)
  infoSimple('foundry', 'the foundry', infoAbout)
})
