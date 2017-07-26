'use strict';
const assert = require('assert');
const jsdom = require('jsdom');
const fs = require('fs');

const rnh_cs = fs.readFileSync('./src/rnh-cs.js', { encoding: 'utf-8'});
const jQuery = fs.readFileSync('./vendor/jquery-3.2.1.min.js', { encoding: 'utf-8'});
const { JSDOM } = jsdom;


function attachScript(dom, scriptContent) {
	var scriptEl = dom.window.document.createElement("script");
	scriptEl.textContent = scriptContent;
	dom.window.document.body.appendChild(scriptEl);
}


describe('rnh tests', function() {
	var window;
	var bg;

	before(function (done) {
        let wasError = false;
	    bg = require('../src/background.js').init({chrome: {
	    	browserAction: {
	    		setIcon: () => null,
				onClicked: {
                    addListener: () => null,
                }
			},
			tabs: {
	    		onActivated: {
	    			addListener: () => null,
				}
			},
			runtime: {
	    		onMessage: {
	    			addListener: () => null,
				}
			}
		}});

	    bg.COOLDOWN_TIME = 0;
	    bg.FINAL_COOLDOWN_TIME = 0;

		JSDOM.fromFile("tests/mock.html", {
			runScripts: 'dangerously',
		}).then(dom => {
			attachScript(dom, jQuery);
			dom.window.eval(`
                var chrome = {
                    runtime: {
                        onMessage: {
                            addListener: () => {},
                        },
                        sendMessage: () => {},
                    }
                }
			`);
			window = dom.window;
            window.onerror = function(messageOrEvent, source, lineno, colno, error) {
                wasError = true;
                done(error);
            };
            attachScript(dom, rnh_cs);
            if (!wasError) {
                done();
            }
		});
	});

	it('should not activate a command', function() {
		for (let userInput of ['we are testing']) {
			testNoOutput(userInput);
		}
	});

	it('should parse subreddit names without spaces', function() {
		let userInput = 'go to r not the onion';
		var [cmd, match] = bg.getCmdForUserInput(userInput);
		assert.ok(match === 'nottheonion', `${userInput} -> ${match}`);
	});

	function testOutput(userInput, expectedCmd) {
		let selectedCmd = bg.getCmdForUserInput(userInput)[0];
		assert.equal(selectedCmd, expectedCmd, selectedCmd);
	}

	function testNoOutput(userInput) {
		var output = bg.getCmdForUserInput(userInput);
		assert.ok(output[0] === null, `${userInput} -> ${output[0]}`);
	}

	let cmdToPossibleInput = {
		'ExpandPreview': ['expand 1st', 'first expand', 'preview twelfe', 'preview eight'],
		'NavigateBackward': ['back', 'go back', 'navigate back', 'navigate backwards', 'backwards', 'backward', 'go backwards'],
		'NavigateForward': ['forward', 'go forward', 'forwards'],
		'NavigateToSubreddit': ['go to our testing', 'are funny',
				'our world news', 'r worldnews'],
		'Reddit': ['reddit', 'home'],
		'ScrollTop': ['top', 'scroll top', 'scrolltop'],
		'ScrollBottom': ['bottom', 'scroll bottom'],
	}

	for (let expectedCmd in cmdToPossibleInput) {
		let possibleUserInputs = cmdToPossibleInput[expectedCmd];
        for (let userInput of possibleUserInputs) {
            it(`"${userInput}" should execute expected ${expectedCmd}`, function() {
                testOutput(userInput, expectedCmd);
			});
		}
	}
});
