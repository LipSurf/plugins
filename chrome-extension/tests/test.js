'use strict';
const assert = require('assert');
const jsdom = require('jsdom');
const fs = require('fs');

const rnh = fs.readFileSync('./src/rnh.js', { encoding: 'utf-8'});
const jQuery = fs.readFileSync('./vendor/jquery-3.2.1.min.js', { encoding: 'utf-8'});
const { JSDOM } = jsdom;


function attachScript(dom, scriptContent) {
	var scriptEl = dom.window.document.createElement("script");
	scriptEl.textContent = scriptContent;
	dom.window.document.body.appendChild(scriptEl);
}


describe('rnh tests', function() {
	var window;

	before(function () {
		return JSDOM.fromFile("tests/mock.html", {
			runScripts: 'dangerously',
		}).then(dom => {
			attachScript(dom, jQuery);
			attachScript(dom, rnh);
			window = dom.window;
		});
	});

	it('should not activate a command', function() {
		for (let userInput of ['we are testing']) {
			testNoOutput(userInput);
		}
	});

	function cmdSelect(input) {
		for (let cmd in window.COMMANDS) {
			let matchOutput = window.COMMANDS[cmd].matches(input);
			if (matchOutput) {
				window.COMMANDS[cmd].run(matchOutput);
				return cmd;
			}
		};
	}

	function testOutput(userInput, expectedCmd) {
		assert.equal(window.getCmdForUserInput(userInput)[0], expectedCmd);
	}

	function testNoOutput(userInput) {
		var output = window.getCmdForUserInput(userInput);
		assert.ok(typeof output === 'undefined', `${userInput} -> ${output ? output[0]: ''}`);
	}

	let cmdToPossibleInput = {
		'NavigateBackward': ['back', 'backward', 'go back'],
		'NavigateForward': ['forward', 'go forward', 'forwards'],
		'ScrollTop': ['top', 'scroll top', 'scrolltop'],
		'ScrollBottom': ['bottom', 'scroll bottom'],
		'Reddit': ['reddit', 'home'],
		'ExpandPreview': ['expand 1st', 'first expand', 'preview twelfe'],
	}

	for (let expectedCmd in cmdToPossibleInput) {
		let possibleUserInputs = cmdToPossibleInput[expectedCmd];
		it(`${expectedCmd} commands match`, function() {
			for (let userInput of possibleUserInputs) {
				testOutput(userInput, expectedCmd);
			}
		});
	}
});
