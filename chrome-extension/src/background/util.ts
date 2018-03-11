import * as CT from "../common/constants"


export class Detector {
    private intervalId: number;
    private checks: number = 0;
    private maxChecks: number;
    private sentinelFn;
    private detectCb;

    // sentinelFn -- returns true when something is detected
    // detectCb -- is run when sentinelFn returns true (once)
    // interval -- how often to run sentinelFn
    constructor(sentinelFn, detectCb, interval: number, maxChecks: number) {
        this.maxChecks = maxChecks;
        this.sentinelFn = sentinelFn;
        this.detectCb = detectCb;
        this.check();
        this.intervalId = window.setInterval(() => {
            this.check();
        }, interval);
    }

    destroy() {
        clearInterval(this.intervalId);
    }

    private check() {
        this.checks += 1;
        new Promise(this.sentinelFn).then((x) => {
            console.log(`calling check ${this.checks} ${new Date()}`);
            clearInterval(this.intervalId);
            this.detectCb(x);
        }, () => {});
        if (typeof(this.maxChecks) !== 'undefined' && this.checks > this.maxChecks) {
            clearInterval(this.intervalId);
        }
    }
}


export namespace ExtensionUtil {
    function _queryActiveTab(cb) {
        if (CT.DEBUG) {
            chrome.tabs.query({ /*active: true, currentWindow: true,*/
                windowType: "normal"
            }, function(tabs) {
                let mostActive;
                for (let tab of tabs) {
                    if (tab.url.startsWith('http')) {
                        if (tab.active) {
                            return cb(tab);
                        }
                        mostActive = tab;
                    }
                }
                return cb(mostActive);
            });
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
                windowType: "normal"
            }, function(tabs) {
                if (tabs.length > 0) {
                    return cb(tabs[0]);
                } else {
                    // try again soon
                }
            });
        }
    }


    export function queryActiveTab(cb) {
        // sometimes tab is null (perhaps when actions are done very quickly)
        new Detector((resolve, reject) => {
                _queryActiveTab((tab) => {
                    if (tab) {
                        console.log(`tabs ${tab}`);
                        resolve(tab);
                    } else {
                        reject();
                    }
                });
            },
            cb,
            200,
            2
        );
    }
}

export let queryActiveTab = ExtensionUtil.queryActiveTab;

