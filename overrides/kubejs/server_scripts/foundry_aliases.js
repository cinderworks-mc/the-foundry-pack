// hearth muscle memory -> essential commands names.
//
// 08-30: rewritten for the ftb exit. ftb-essentials is gone; the command mod is now
// essentialcommands (modrinth mkkA9ILT, mod id `rift_essentials`, github.com/voxelrift/essentials).
// verified against the shipped essentials-neoforge-1.0.0.jar and the v1.0.0 tag, not from docs.
//
// what that killed:
//   /ec      - native. essentialcommands registers `ec` itself as an alias of `enderchest`.
//   /homes   - native, but ONLY while [homes] multiple_homes = true in essential.commands.toml.
//   /warps   - native.
// so all three aliases this file used to carry are dead weight and are gone.
//
// what it broke, and what is left here:
//   ftb and the hearth (fuji) use /tpaccept and /tpdeny. essentialcommands registers
//   `tpaaccept` and `tpadeny`, and BOTH of them REQUIRE a player argument - there is no bare
//   form (TeleportAskCommand.register: literal("tpaaccept").then(argument("player", ...)),
//   no .executes() on the literal itself). so the alias has to carry the name through, which
//   is why this is an argument node and not the bare literal the /ec alias used to be.
//   the bare /tpaccept and /tpdeny still register, purely to say what the right form is
//   instead of letting brigadier answer "Unknown command".
//
// mechanism: each alias runs the target AS the player. EntityKJS.kjs$runCommand /
// kjs$runCommandSilent exist in kubejs 2101.7.2 (javap'd) and build the source from
// entity.createCommandSourceStack(), so the player's own permission level applies and any
// output comes back to them. not using brigadier redirect(): a bare redirect does not carry
// the target's executes() over, which is what made the old /ec alias need executes().
//
// `event.arguments` is CommandRegistryKubeEvent.getArguments() -> ArgumentTypeWrappers
// (javap'd the pinned kubejs-neoforge-2101.7.2-build.374.jar 08-30). PLAYER.create(event) is
// vanilla EntityArgument.player(), so tab-completion and "no player was found" come free;
// PLAYER.getResult(ctx, name) hands back the ServerPlayer, and `.username` on that is the same
// accessor every other script in this repo uses.
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  // /tpaccept <player> -> /tpaaccept <player>, /tpdeny <player> -> /tpadeny <player>
  const tpaAlias = (name, target) => {
    event.register(
      Commands.literal(name)
        .then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(ctx => {
          // var, not const: rhino hoists a const declared inside a handler body to the shared
          // script scope, so the second run throws "redeclaration of var". see the 08-29 note
          // in foundry_first_join.js.
          try {
            var p = ctx.source.player
            if (!p) return 0
            var other = Arguments.PLAYER.getResult(ctx, 'player')
            p.runCommand(target + ' ' + other.username)
            return 1
          } catch (e) {
            console.error('foundry: /' + name + ' alias failed - ' + e)
            return 0
          }
        }))
        .executes(ctx => {
          var p = ctx.source.player
          if (!p) return 0
          p.tell(Text.of('/' + name + ' needs a name: /' + name + ' <player>. or just click [Yes] / [No] in the request.').gold())
          return 1
        })
    )
  }

  tpaAlias('tpaccept', 'tpaaccept')
  tpaAlias('tpdeny', 'tpadeny')

  // /tps: unrelated to any of the above, essentialcommands has none either. read the server's
  // own tick timer (mojmap MinecraftServer getAverageTickTimeNanos, 1.20.3+); if that mapping is
  // not exposed the way i think, fall back to running `neoforge tps` as the player - UNVERIFIED
  // whether that needs permission level 2, so the fallback may print nothing for non-ops.
  // watch logs/kubejs/server.log on first use.
  event.register(Commands.literal('tps').executes(ctx => {
    const p = ctx.source.player
    if (!p) return 0
    try {
      const ms = ctx.source.server.getAverageTickTimeNanos() / 1000000.0
      const tps = Math.min(20.0, 1000.0 / Math.max(ms, 0.001))
      p.tell(Text.of('tps ' + tps.toFixed(1) + ' (' + ms.toFixed(1) + ' ms/tick)').gold())
    } catch (e) {
      // 08-29: was a bare catch, so the "watch logs/kubejs/server.log on first use" note
      // above could never pay off - nothing was ever written. getAverageTickTimeNanos()
      // is confirmed present on MinecraftServer in 1.21.1 (javap'd the neoforge
      // server-1.21.1 jar), so this branch should be unreachable; say so if it is not.
      console.error('foundry: /tps direct read failed, falling back to neoforge tps - ' + e)
      p.runCommand('neoforge tps')
    }
    return 1
  }))
})
