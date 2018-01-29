#!/bin/bash
ssh lubuntu 'killall chrome ; . ~/.nvm/nvm.sh && nvm use default && cd /media/sf_no-hands-man/ && export DISPLAY=:0.0; export AUDIO_CACHE_FOLDER=/media/sf_VM_Share/custom-tester/audio-cache; export PLUGINS=$PWD/chrome-extension/plugins/browser.js,$PWD/chrome-extension/plugins/reddit.js; export PATH=$PATH:/media/sf_VM_Share/custom-tester; ./node_modules/mocha/bin/mocha' $@
