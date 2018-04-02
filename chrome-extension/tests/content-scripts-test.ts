/*
 *  Tests compiled versions that are in chrome-extension/dist
 */
import * as sinon from 'sinon';
import {test} from 'ava';
import {JSDOM} from 'jsdom';

const path = require('path');
const fs = require('fs');

// attachable shits
const readFileSync = file_name => fs.readFileSync(file_name, { encoding: 'utf-8' });
const BASE_DIR = `${path.join(__dirname, '..', '..', '..', 'chrome-extension')}/`;

const csScripts = [`main.js`, `frame-beacon.js`];

const CS_BUILTINS = `
    var chrome = {
        runtime: {
            onMessage: {
                addListener: function () { },
            },
            sendMessage: function () { },
            connect: function() {},
        },
        storage: {
            local: {
                get: function () {
                    return {activated: true};
                },
            },
        }
    };
`;

function attachScript(dom, scriptContent) {
    var scriptEl = dom.window.document.createElement("script");
    scriptEl.textContent = scriptContent;
    dom.window.document.body.appendChild(scriptEl);
}


for (let csName of csScripts) {
    test.cb(`${csName} has no errors when added to DOM`, (t) => {
            JSDOM.fromFile("tests/mock.html", {
                runScripts: 'dangerously',
            }).then(dom => {
                dom.window.onerror = function(messageOrEvent, source, lineno, colno, error) {
                    t.fail(messageOrEvent.toString());
                };
                attachScript(dom, CS_BUILTINS);
                attachScript(dom, readFileSync(`${BASE_DIR}dist/page/${csName}`));
                t.end();
            });
    });
}
