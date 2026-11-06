#!/usr/bin/env bash
# Refuse public repositories and published releases even if the caller changes.
set -euo pipefail
repo=${GITHUB_REPOSITORY:?}
tag=$1
target=$2
shift 2
test "$(gh api "repos/$repo" --jq '.private')" = true
if gh release view "$tag" --repo "$repo" --json isDraft >/dev/null 2>&1; then
  test "$(gh release view "$tag" --repo "$repo" --json isDraft,targetCommitish --jq '.isDraft and (.targetCommitish == "'"$target"'")')" = true
  gh release upload "$tag" "$@" --repo "$repo" --clobber
else
  gh release create "$tag" "$@" --repo "$repo" --draft --target "$target" --title "$tag" --notes "CI-validated delivery. Source commit $target."
fi
