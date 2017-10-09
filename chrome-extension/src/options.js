var cmdGroups;

// load options
function getCmds(name) {
    return new Promise((resolve, reject) => {
        var cmdFn;
        var request = new XMLHttpRequest();
        request.open('GET', chrome.runtime.getURL(`commands/${name}.js`), true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                cmdFn = eval(`(function() { ${request.responseText} })()`);
            } else {
                // We reached our target server, but it returned an error

            }
            resolve(cmdFn);
        };

        request.onerror = function() {
            // There was a connection error of some sort
        };

        request.send();
    });
}


function _save(obj) {
    chrome.storage.sync.set({'cmdGroups': obj}, function() {
        console.log("Settings saved " + JSON.stringify(obj));
    });
}

function _reset() {
    chrome.storage.sync.clear();
    loadFresh();
}

function loadSavedOrFresh() {
    // null loads everything
    chrome.storage.sync.get(null, function(loaded) {
        if (typeof(loaded) != 'object' || typeof(loaded.cmdGroups) != 'object'|| !loaded.cmdGroups.length) {
            loadFresh();
        } else {
            startup(loaded.cmdGroups);
        }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});

function startup(cmdGroups) {
    riot.mount('options-page', { cmdGroups: cmdGroups });
}


function loadFresh() {
    Promise.all([getCmds('browser'), getCmds('reddit')]).then(function(preCmdGroups) {
        // Transform the cmdGroups into useable form
        cmdGroups = preCmdGroups.map((item) => {
            item.collapsed = false;
            item.enabled = true;

            item.homophones = Object.keys(item.homophones).map(function(key, index) {
                return {
                    source: key,
                    enabled: true,
                    destination: item.homophones[key]
                };
            });

            item.commands.map((cmd) => {
                // make sure it's defined so we don't take parents
                cmd.description = cmd.description ? cmd.description : null;
                cmd.enabled = true;
            });

            return item;
        });
        startup(cmdGroups);
    });
}

loadSavedOrFresh();