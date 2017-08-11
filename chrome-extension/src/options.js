$(document).ready(function() {
    var $micPerm = $('#mic_perm');

    function toggleMicPerm(enabled) {
        $micPerm.toggleClass('success', enabled);
        $micPerm.toggleClass('failure', !enabled);
        $micPerm.find('i').text(enabled ? 'check_circle': 'error');
        $micPerm.find('span').text(enabled ? 'Has microphone permission' : 'Needs microphone permission');
        $('#done').css('visibility', enabled ? 'visible' : 'hidden');
    }

    navigator.webkitGetUserMedia({
        audio: true,
    }, function(stream) {
        console.log("yes permission");
        toggleMicPerm(true);
    }, function() {
        // Aw. No permission (or no microphone available).
        console.log("no permission");
        // let rec = new webkitSpeechRecognition();
        // console.log(`rec ${rec}`);
        // rec.start();
        // recognition.onerror = function(event) {
        toggleMicPerm(false);
    });
});

// load options
function getCmds() {
    return new Promise((resolve, reject) => {
        var cmdFn;
        var request = new XMLHttpRequest();
        request.open('GET', chrome.runtime.getURL('commands/browser.js'), true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                cmdFn = eval(`(function() { ${request.responseText} })()`);
            } else {
                // We reached our target server, but it returned an error

            }
            resolve(cmdFn.commands);
        };

        request.onerror = function() {
            // There was a connection error of some sort
        };

        request.send();
    });
}


getCmds().then(function(cmds) {
    riot.mount('options-page', {
        cmds: _.values(_.mapValues(cmds, (value, key) => { value.name = key; return value; }))
    });
    // riot.mount('cmd-group');
    // riot.mount('cmd');
});