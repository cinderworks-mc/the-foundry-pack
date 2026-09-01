// hand every player a short guide book the first time they join. flag lives in persistent data
// and is only set once the give actually succeeded. uses /give with 1.21 item components,
// because Item.of() with a component map object failed to parse in kubejs 2101.7.2.
// pages are {raw:'<json text component>'}: a plain snbt string is rejected as "Not a map" (tested 08-26);
// the json string carries the newlines, so no literal newlines are needed in the command.
const FOUNDRY_BOOK = "minecraft:written_book[minecraft:written_book_content={title:{raw:\"the foundry\"},author:\"patrick\",pages:[{raw:'{\"text\": \"welcome to the foundry.\\n\\ncreate is the backbone, ars nouveau is the magic, and the world is full of yung\'s dungeons to go poke at. the three trees do not depend on each other. pick whichever looks fun.\"}'},{raw:'{\"text\": \"create\\n\\npress W while looking at any create block for a ponder scene. that is the whole tutorial, and it is a good one.\\n\\ntfmg (the factory must grow) is the deep end of the create tree. oil, steel, electricity. not required for anything else.\"}'},{raw:'{\"text\": \"ars nouveau\\n\\nyou spawned with a worn notebook. read it. glyphs, spellbooks, source. ars creo bridges it into create if you want machines that cast.\\n\\niron\'s spells is the other magic: find spellbooks and scrolls out in the world.\"}'},{raw:'{\"text\": \"ae2\\n\\nstorage for later. the guide is in jei: look up any ae2 item and hit the guide button. applied create bridges it into create.\"}'},{raw:'{\"text\": \"loot\\n\\nchests in dungeons are per player (lootr). everyone gets their own roll, nobody can loot-ninja you. they refresh over time.\\n\\napotheosis adds affix gear, gems and boss spawners. the pink spawners bite.\"}'},{raw:'{\"text\": \"dying\\n\\na grave keeps your stuff (corail tombstone). walk back to it, sneak on it, everything comes back.\\n\\nheart canisters raise your max hearts. eat a variety of food (spice of life) for more.\"}'},{raw:'{\"text\": \"getting around\\n\\nwaystones are free, no xp cost. steam n rails trains exist if you want to be fancy about it.\\n\\nhold ` (left of the 1 key) while mining to vein mine an ore or a tree.\\n\\n/sethome first, then /home. /rtp /tpa /back /spawn all work.\"}'},{raw:'{\"text\": \"claims\\n\\nright-click two opposite corners on the ground with a golden hoe. that box is yours, nobody else can build in it or open your chests.\\n\\n/flan menu while standing in it to let friends in. /flan help for the rest.\"}'},{raw:'{\"text\": \"servers\\n\\nthis is modded.hartforge.dev. the vanilla server is vanilla.hartforge.dev. chat is shared between both and discord, so say hi.\\n\\nwear one armor set, look like another: cosmetic armor slots are in your inventory.\\n\\nlost this book? /foundrybook\"}'},{raw:'{\"text\": \"this pack is a first draft. if something is broken, duplicated, or dumb, say so in discord. that is the point of you being here.\\n\\n- patrick\"}'}]}]"
// give can return 0 right after a restart, while the server is still ticking
// through the join backlog - retry a few times, 1s apart, before giving up
// (08-27: hit two players in a row on a restart-heavy night).
const pendingBook = {}

function tryGiveBook(server, player) {
  // 08-29: this used to `return` bare. a player who already had the flag from an earlier
  // session but was sitting in pendingBook would then never be cleared, so the retry loop
  // below would carry them forever. clear on the way out.
  if (player.persistentData.getBoolean('foundry_book')) {
    delete pendingBook[player.username]
    return
  }
  // 08-29: this was `const ok = server.runCommandSilent(...)` followed by `if (ok > 0)`.
  // kjs$runCommandSilent(String) returns VOID in kubejs 2101.7.2 (javap'd on
  // MinecraftServerKJS in the pinned jar), so ok was always undefined and `ok > 0` was
  // always false. the flag was never set, the chat line never fired, every join re-gave
  // the book, and every joining name got parked in pendingBook and never taken out.
  // there is no int-returning runCommand on the server in this build, so gate on the one
  // thing that is readable: whether /give can resolve the name yet, ie whether the player
  // is in the online list. that is the actual 08-27 failure (join backlog after a
  // restart), and the retry below still covers it.
  if (!server.players.find(p => p.username === player.username)) {
    const tries = (pendingBook[player.username] || 0) + 1
    if (tries >= 4) {
      delete pendingBook[player.username]
      console.error('foundry: book give failed for ' + player.username + ' after 4 attempts, /foundrybook still works')
      return
    }
    pendingBook[player.username] = tries
    return
  }
  server.runCommandSilent('give ' + player.username + ' ' + FOUNDRY_BOOK)
  player.persistentData.putBoolean('foundry_book', true)
  player.tell('a book about this place is in your inventory. read it or do not, up to you.')
  delete pendingBook[player.username]
}

PlayerEvents.loggedIn(event => {
  tryGiveBook(event.server, event.player)
})

ServerEvents.tick(event => {
  if (event.server.tickCount % 20 !== 0) return // once a second
  const pendingUsernames = Object.keys(pendingBook)
  if (pendingUsernames.length === 0) return
  // 08-27: event.server.getPlayer(x) takes a UUID string, not a username -
  // threw "UUID string must be 32 or 36 characters long" every tick once a
  // name was pending. iterate the online list and match on .username instead,
  // which is the same property already used everywhere else in this file.
  // 08-29: this was `for (const username of pendingUsernames)` with a `const player`
  // declared in the loop body. rhino does not give a for-of body a fresh scope per pass -
  // it puts the const on the shared script scope via ScriptableObject.putConstProperty -
  // so the SECOND time this handler ran it threw "TypeError: redeclaration of var player"
  // and kept throwing every second forever. it never got as far as tryGiveBook, so the
  // pending name never drained and never hit the 4-try bailout (zero "book give failed"
  // lines in 5.5h of logs, alongside 20128 stack traces). forEach gives each pass a real
  // function scope, so the const is fresh every time.
  const online = event.server.players
  pendingUsernames.forEach(username => {
    const player = online.find(p => p.username === username)
    if (!player) { delete pendingBook[username]; return } // logged out, stop retrying
    tryGiveBook(event.server, player)
  })
})

// /foundrybook - hand the book to whoever asks (lost it, or joined before the script worked)
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  event.register(Commands.literal('foundrybook').executes(ctx => {
    const p = ctx.source.player
    if (!p) return 0
    ctx.source.server.runCommandSilent('give ' + p.username + ' ' + FOUNDRY_BOOK)
    return 1
  }))
})
