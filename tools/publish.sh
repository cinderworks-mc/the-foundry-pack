#!/usr/bin/env bash
# DRAFT - not wired up yet, review before first use.
#
# publish one released version of the foundry pack to this repo + github releases.
# run it AFTER the release is built and live, with the source checkout sitting at
# exactly the released state (clean tree, PACK_VERSION matching <version>).
#
# usage: FOUNDRY_SRC=/path/to/pack-source tools/publish.sh <version>
set -euo pipefail

v="${1:?usage: FOUNDRY_SRC=/path/to/pack-source tools/publish.sh <version>}"
src="${FOUNDRY_SRC:?point FOUNDRY_SRC at the pack source checkout}"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"

mrpack="$src/dist/foundry-1.21.1-$v.mrpack"
[ -f "$mrpack" ] || { echo "missing $mrpack" >&2; exit 1; }

# copy the released pack source in
rsync -a --delete "$src/overrides/" "$repo_root/overrides/"
cp "$src/manifest.txt" "$repo_root/manifest.txt"
cp "$src/notes/CHANGELOG.md" "$repo_root/CHANGELOG.md"

cd "$repo_root"
git add -A
git commit -m "$v"
git tag "$v"
git push origin main "$v"
gh release create "$v" "$mrpack" \
  --repo cinderworks-mc/the-foundry-pack \
  --title "$v" \
  --notes "changes in CHANGELOG.md. import the .mrpack with the modrinth app."

# NOTE (09-16-2026): github-primary now - `origin` above pushes straight to
# github.com/cinderworks-mc/the-foundry-pack, no forgejo mirror in between, so
# the tag exists on github the moment `git push` returns and `gh release
# create` above should land non-draft immediately. the old forgejo copy
# (patrickhere/the-foundry-pack) is archived.
