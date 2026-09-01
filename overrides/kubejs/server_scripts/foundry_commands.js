// parity with the hearth: players there have /day /night /sun /storm (votes via fuji + calcifer).
// first-draft version here is direct, no vote, anyone can run. revisit if it gets abused.
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  const simple = (name, cmd, msg) => event.register(
    Commands.literal(name).executes(ctx => {
      const s = ctx.source.server
      s.runCommandSilent(cmd)
      s.tell(Text.of(msg).gold())
      return 1
    })
  )
  simple('day',   'time set day',        'the sun comes up')
  simple('night', 'time set night',      'the sun goes down')
  simple('sun',   'weather clear',       'the sky clears')
  simple('storm', 'weather thunder',     'a storm rolls in')
})
