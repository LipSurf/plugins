// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// This file should only be included in a build that needs to run automated tests
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var port = chrome.runtime.connect({name: "test-probe"});

window.addEventListener("message", function (evt) {
    let { data, source, origin } = evt;
    let msg = data;
    if (msg.test_probe) {
        port.postMessage({cmd: msg.cmd});
    }
});
