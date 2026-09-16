// /calc <expression>: stack math in chat. same commandRegistry shape as foundry_info.js.
// `/calc 1000` -> 1000 = 15 stacks + 40 (0 shulkers + 15 stacks + 40)
// `/calc 3*64+12` -> 204 = 3 stacks + 12
// the expression is whitelisted to digits, + - * / ( ) . and spaces before it is evaluated,
// so nothing but arithmetic can reach eval. rhino rules: var only inside handlers.
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  event.register(
    Commands.literal('calc')
      .then(Commands.argument('expr', Arguments.GREEDY_STRING.create(event)).executes(ctx => {
        try {
          var p = ctx.source.player
          if (!p) return 0
          var expr = String(Arguments.GREEDY_STRING.getResult(ctx, 'expr')).trim()
          if (!/^[0-9+\-*/(). ]+$/.test(expr) || expr.length > 60) {
            p.tell(Text.of('calc: numbers and + - * / ( ) only').red())
            return 0
          }
          var value = eval(expr)
          if (typeof value !== 'number' || !isFinite(value)) {
            p.tell(Text.of('calc: that does not compute').red())
            return 0
          }
          var shown = Math.round(value * 100) / 100
          var n = Math.floor(Math.abs(value))
          var stacks = Math.floor(n / 64)
          var rest = n % 64
          var shulkers = Math.floor(stacks / 27)
          var stacksLeft = stacks % 27
          var line = expr + ' = ' + shown + '  ->  ' + stacks + ' stacks + ' + rest
          if (shulkers > 0) line += '  (' + shulkers + ' shulkers + ' + stacksLeft + ' stacks + ' + rest + ')'
          p.tell(Text.of(line).gold())
          return 1
        } catch (e) {
          console.error('foundry: /calc failed - ' + e)
          return 0
        }
      }))
  )
})
