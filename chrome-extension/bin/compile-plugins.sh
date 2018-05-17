#!/bin/bash
tsc -p tsconfig.plugins.json

if [[ $1 == "--debug" ]]; then
  echo "Debug output"
  cp build/* chrome-extension/dist/plugins/
else
  ./node_modules/.bin/uglifyjs -c pure_funcs='console.log' ./build/reddit.js > chrome-extension/dist/plugins/reddit.js
  ./node_modules/.bin/uglifyjs -c pure_funcs='console.log' ./build/browser.js > chrome-extension/dist/plugins/browser.js
  ./node_modules/.bin/uglifyjs -c pure_funcs='console.log' ./build/google.js > chrome-extension/dist/plugins/google.js
fi

rm -r build || true
