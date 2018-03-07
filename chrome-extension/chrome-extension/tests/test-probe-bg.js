// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// This file should only be included in a build that needs to run automated tests
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
chrome.storage.local.clear();

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'test-probe') {
        port.onMessage.addListener(function(msg) {
            console.log(`RECEIVED A FKIN MSG`);
            eval(msg.cmd);
        });
    }
});
