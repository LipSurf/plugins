var cmdGroups;


function _save(obj) {
    chrome.storage.sync.set({'cmdGroups': obj}, function() {
        console.log("Settings saved " + JSON.stringify(obj));
    });
}


function _reset() {
    chrome.storage.sync.clear();
}


function loadSaved() {
    // null loads everything
    chrome.storage.sync.get(null, function(loaded) {
        startup(loaded.cmdGroups);
    });
}


chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log("Chrome storage changes");
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


loadSaved();