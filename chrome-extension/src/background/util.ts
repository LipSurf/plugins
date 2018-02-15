import * as CT from "./constants"


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

const customArgumentsToken = Symbol("__ES6-PROMISIFY--CUSTOM-ARGUMENTS__");

export function promisify<T>(original, withError: boolean = false): (...args) => Promise<T> {

    // Ensure the argument is a function
    if (typeof original !== "function") {
        throw new TypeError("Argument to promisify must be a function");
    }

    // If the user has asked us to decode argument names for them, honour that
    const argumentNames = original[customArgumentsToken];

    // If we can find no Promise implemention, then fail now.
    if (typeof Promise !== "function") {
        throw new Error("No Promise implementation found; do you need a polyfill?");
    }

    return function (...args) {
        return new Promise((resolve, reject) => {

            // Append the callback bound to the context
            args.push(function callback() {
                let values = [];
                for (var i = withError ? 1 : 0; i < arguments.length; i++) {
                    values.push(arguments[i]);
                }

                if (withError && arguments[0]) {
                    return reject(arguments[0]);
                }

                if (values.length === 1 || !argumentNames) {
                    return resolve(values[0]);
                }

                let o: T;
                values.forEach((value, index) => {
                    const name = argumentNames[index];
                    if (name) {
                        o[name] = value;
                    }
                });

                resolve(o);
            });

            // Call the function.
            original.call(this, ...args);
        });
    };
}