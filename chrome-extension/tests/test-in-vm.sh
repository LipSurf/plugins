#!/bin/bash
# We can control the mouse and click the extension button, test across browser restarts etc with this
# magic script.
debug=''

while getopts 'd' flag; do
  case "${flag}" in
    d) debug='--inspect' ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

WRITABLE_FOLDER=/media/sf_VM_Share/custom-tester
EXTENSION_FOLDER=/media/sf_lipsurf
ssh lubuntu "killall chrome ; . ~/.nvm/nvm.sh && nvm use default && cd $WRITABLE_FOLDER && export DISPLAY=:0.0; export AUDIO_CACHE_FOLDER=$WRITABLE_FOLDER/audio-cache; export PLUGINS=$EXTENSION_FOLDER/chrome-extension/dist/plugins/browser.js,$EXTENSION_FOLDER/chrome-extension/dist/plugins/reddit.js; node $debug $WRITABLE_FOLDER/node_modules/ava/cli.js -T 20000 --verbose $EXTENSION_FOLDER/${@: -1}"
