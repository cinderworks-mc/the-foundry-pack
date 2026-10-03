```text
      _           _                                _        
  ___(_)_ __   __| | ___ _ __  __      _____  _ __| | _____ 
 / __| | '_ \ / _` |/ _ \ '__| \ \ /\ / / _ \| '__| |/ / __|
| (__| | | | | (_| |  __/ |     \ V  V / (_) | |  |   <\__ \
 \___|_|_| |_|\__,_|\___|_|      \_/\_/ \___/|_|  |_|\_\___/
                                                            
```

# the foundry

modded minecraft on neoforge 1.21.1. create is the backbone, ars nouveau is the
magic, and the world is full of dungeons to go poke at.

server address: `modded.cinderworks.dev`

## install

easiest: open [the pack on modrinth](https://modrinth.com/modpack/the-foundry-pack)
and hit install in the [modrinth app](https://modrinth.com/app). it builds the
instance and keeps it updated on its own, so a new pack version is just a
restart. prism launcher adds it straight from modrinth search too.

rather hold the file yourself? grab the newest `.mrpack` from
[releases](https://github.com/cinderworks-mc/the-foundry-pack/releases) or the
[pack page](https://cinderworks.dev/foundry/pack/), then in your launcher: add
instance, from file, pick the `.mrpack`. you will be re-importing by hand every
update, which is why this is the backup route.

either way, join `modded.cinderworks.dev` - it is already in your server list.

## what is in here

`manifest.txt` is the full mod list, `CHANGELOG.md` is what changed each
release, `overrides/` is our configs and kubejs scripts. nothing third party is
bundled: the launcher fetches every mod from its author's own modrinth upload.

## shipping a release

`tools/publish.sh <version>` does the mechanical part. as of 09-16-2026 this
repo is github-primary (`origin` is `github.com/cinderworks-mc/the-foundry-pack`
directly, no forgejo mirror in between) - `git push origin main <tag>` lands
the tag on github immediately, so `gh release create <tag> <mrpack> -R
cinderworks-mc/the-foundry-pack` right after works cleanly, no draft dance.
verify with `gh release view <tag> -R cinderworks-mc/the-foundry-pack --json
isDraft,assets`: `isDraft` must be `false` and the mrpack must be attached.

more at [cinderworks.dev](https://cinderworks.dev)
