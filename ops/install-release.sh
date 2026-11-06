#!/bin/sh
# Download and start one checked main build. Requires gh, jq and Docker Compose v2.
set -eu
run=${1:-}
mode=${2:-public}
case "$run" in ''|*[!0-9]*) echo 'Usage: sh ops/install-release.sh RUN_ID [public|preview]' >&2; exit 2;; esac
case "$mode" in public|preview) ;; *) echo 'Mode must be public or preview' >&2; exit 2;; esac
repo=${GH_REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}
root=${SAMMAKKO_RELEASE_DIR:-./sammakko-releases}
sha=$(gh run view "$run" -R "$repo" --json headSha,headBranch,conclusion,workflowName |
  jq -er 'select(.headBranch == "main" and .conclusion == "success" and .workflowName == "ci") | .headSha | select(test("^[a-f0-9]{40}$"))')
mkdir -p "$root"
release=$root/$sha
if [ ! -d "$release" ]; then
  tmp=$(mktemp -d "$root/.download.XXXXXXXX")
  trap 'rm -rf -- "$tmp"' EXIT
  name=sammakko-server-$sha
  if ! gh run download "$run" -R "$repo" -n "$name" -D "$tmp/server"; then
    # The private draft is the delivery fallback when Actions storage is unavailable.
    gh release download "$name" -R "$repo" -p "$name.tar.gz" -D "$tmp"
    mkdir -p "$tmp/from-release"
    tar -xzf "$tmp/$name.tar.gz" -C "$tmp/from-release"
    package=$tmp/from-release
  else
    package=$tmp/server
  fi
  for file in Dockerfile compose.yaml nginx.conf site/release.json; do test -s "$package/$file"; done
  jq -e --arg sha "$sha" '.sourceCommit == $sha' "$package/site/release.json" >/dev/null
  mv -T "$package" "$release"
  rm -rf -- "$tmp"
  trap - EXIT
fi
cd "$release"
if ! jq -e --arg sha "$sha" --arg mode "$mode" '.sourceCommit == $sha and .publication.mode == $mode' site/release.json >/dev/null; then
  echo 'The downloaded release does not match the requested commit and publication mode.' >&2
  exit 1
fi
SAMMAKKO_RELEASE="$sha" docker compose -p "${SAMMAKKO_PROJECT:-sammakko}" up --build -d --wait
printf 'Started %s (%s) at http://127.0.0.1:%s/\n' "$sha" "$mode" "${SAMMAKKO_PORT:-8080}"
