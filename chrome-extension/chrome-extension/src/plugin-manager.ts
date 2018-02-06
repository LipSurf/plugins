import * as _ from "lodash";
import * as CT from "./constants";
import { PluginSandbox } from "./plugin-sandbox";

interface IPlugin {
    matches: RegExp,
    cs: string
}

export class PluginManager {
    private plugins: IPlugin[] = [];
    private pluginSandbox: PluginSandbox;

    constructor(pluginSandbox: PluginSandbox) {
        this.pluginSandbox = pluginSandbox;
    }

    // load plugin
    // TODO: wait for promise of plugins loaded?
    loadContentScriptsForUrl(tabId: number, url: string) {
        for (let i = 0; i < this.plugins.length; i++) {
            if (this.plugins[i].matches.test(url)) {
                chrome.tabs.executeScript(tabId, {code: this.plugins[i].cs, runAt: "document_start"}, function() {
                    //script injected
                });
            }
        }
    }

    // TODO: when ES6 System.import is supported, switch to using that
    // load options
    private getPlugin(name: string) {
        return new Promise((resolve, reject) => {
            var cmdFn;
            var request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`plugins/${name}.js`), true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    cmdFn = eval(`module={}; ${request.responseText}`);
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


    // Load the plugins that are factory-installed
    // and save them in chrome storage
    loadDefault() {
        return new Promise((resolve, reject) => {
            Promise.all([this.getPlugin('browser'), this.getPlugin('reddit')]).then(function(preCmdGroups) {
                // Transform the cmdGroups into useable form
                let pluginData = { cmdGroups: preCmdGroups.map((item: any) => {
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
                        cmd.run ? cmd.run = cmd.run.toString() : undefined;
                    });

                    if (!item.pageInit) {
                        item.pageInit = '() => null';
                    }

                    return item;
                })};

                chrome.storage.local.set(pluginData, function() {
                    return resolve(pluginData);
                });
            });
        });
    }


    // Only the enabled stuff
    loadPlugins() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (loaded) => {
                new Promise((resolve, reject) => {
                    if (!loaded || !loaded.cmdGroups) {
                        return this.loadDefault().then((loadedDefaults) => resolve(loadedDefaults));
                    } else {
                        return resolve(loaded);
                    }
                }).then((loaded: any) => {
                    let reducer = (x, y=[]) => _.reduce(loaded.cmdGroups, (combined, cmdGroup) => _.filter(cmdGroup[x], 'enabled').concat(combined), y);
                    var combinedHomophones = reducer('homophones', _.map(CT.HOMOPHONES, (v, k) => { return {source: k, destination: v, enabled: true}; }));
                    var commands = [];
                    for (let cmdGroup of _.filter(loaded.cmdGroups, 'enabled')) {
                        var keyedCommands = cmdGroup.commands.map((c) => `commands['${cmdGroup.name}']['${c.name}'] = ${c.runOnPage};`);
                        this.pluginSandbox.addCommands(cmdGroup.name, _.reduce(cmdGroup.commands, (memo, c) => {
                            if (c.run) {
                                memo[c.name] = c.run.toString();
                            }
                            return memo;
                        }, {}));
                        commands.push(_.pick(cmdGroup, ['name', 'commands']));
                        this.plugins.push({
                            matches: cmdGroup.matches,
                            cs: `(${cmdGroup.pageInit.toString()})(); commands['${cmdGroup.name}'] = {}; ${keyedCommands.join(';')}`,
                        });
                    }
                    resolve([commands, combinedHomophones]);
                });
            });
        });
    }
}
