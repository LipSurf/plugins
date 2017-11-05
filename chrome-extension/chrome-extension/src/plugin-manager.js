// A utility for background pages to manage the modules for no-hands man.
exports.PM = function({
    chrome,
    _,
    CT,     // constants
} = {}) {
    var pub = {};
    var plugins = [];

    // load plugin
    pub.loadContentScriptsForUrl = function(tabId, url) {
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].matches.test(url)) {
                chrome.tabs.executeScript(tabId, {code: plugins[i].cs, runAt: "document_start"}, function() {
                    //script injected
                });
            }
        }
    };

    // TODO: when ES6 System.import is supported, switch to using that
    // load options
    pub._getPlugin = function(name) {
        return new Promise((resolve, reject) => {
            var cmdFn;
            var request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`plugins/${name}.js`), true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    cmdFn = eval(`(function() {${request.responseText}})()`);
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
    };


    // Load the plugins that are factory-installed
    // and save them in chrome storage
    pub.loadDefault = function() {
        return new Promise((resolve, reject) => {
            Promise.all([pub._getPlugin('browser'), pub._getPlugin('reddit')]).then(function(preCmdGroups) {
                // Transform the cmdGroups into useable form
                let pluginData = { cmdGroups: preCmdGroups.map((item) => {
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
                        // Make all the functions strings (because we can't store them directly)
                        cmd.runOnPage = cmd.runOnPage ? cmd.runOnPage.toString() : '() => null';
                    });

                    if (!item.pageInit) {
                        item.pageInit = '() => null';
                    }

                    return item;
                })};

                chrome.storage.sync.set(pluginData, function() {
                    return resolve(pluginData);
                });
            });
        });
    };


    // Only the enabled stuff
    pub.loadPlugins = function() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, function(loaded) {
                new Promise((resolve, reject) => {
                    if (!loaded || !loaded.cmdGroups) {
                        return pub.loadDefault().then((loadedDefaults) => resolve(loadedDefaults));
                    } else {
                        return resolve(loaded);
                    }
                }).then((loaded) => {
                    let reducer = (x, y=[]) => _.reduce(loaded.cmdGroups, (combined, cmdGroup) => _.filter(cmdGroup[x], 'enabled').concat(combined), y);
                    var combinedHomophones = reducer('homophones', _.map(CT.HOMOPHONES, (v, k) => { return {source: k, destination: v, enabled: true}; }));
                    var commands = [];
                    for (let cmdGroup of _.filter(loaded.cmdGroups, 'enabled')) {
                        var keyedCommands = cmdGroup.commands.map((c) => `commands['${cmdGroup.name}']['${c.name}'] = ${c.runOnPage};`);
                        commands.push(_.pick(cmdGroup, ['name', 'commands']));
                        plugins.push({
                            matches: cmdGroup.matches,
                            cs: `(${cmdGroup.pageInit.toString()})(); commands['${cmdGroup.name}'] = {}; ${keyedCommands.join(';')}`,
                        });
                    }
                    resolve([commands, combinedHomophones]);
                });
            });
        });
    };

    return pub;
};