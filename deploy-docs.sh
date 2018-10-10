#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
echo 'docs.lipsurf.com' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:lipsurf/plugins.git master:gh-pages

cd -
