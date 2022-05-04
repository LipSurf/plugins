#!/usr/bin/env sh
# this is run via circle-ci automatically, usually

# abort on errors
set -e

# build
pnpm docs:build

# navigate into the build output directory
cd docs/.vitepress/dist

# if you are deploying to a custom domain
echo 'docs.lipsurf.com' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:lipsurf/plugins.git master:gh-pages

cd -
