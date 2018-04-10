const customArgumentsToken = Symbol("__ES6-PROMISIFY--CUSTOM-ARGUMENTS__");
let safeSetTimeout = typeof window === 'undefined' ? setTimeout : window.setTimeout;

// TODO: This would be nice to have
// export class DisableableArray<T extends IDisableable> extends Array<T> {
//     constructor(...items) {
//         super(...items);
//         // Object.setPrototypeOf(this, DisableableArray.prototype);
//     }

//     public onlyEnabled(): DisableableArray<T>
//     {
//         // TODO: can this be improved?
//         // let ret = new DisableableArray<T>();
//         // ret.concat(this.filter((item) => item.enabled))
//         // return ret;
//         let ret = this.filter((item) => item.enabled);
//         // Object.setPrototypeOf(ret, DisableableArray.prototype);
//         return new DisableableArray<T>(ret);
//     }

// }


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


export class Detector {
    private intervalId: number;
    private checks: number = 0;
    private maxChecks: number;
    private sentinelFn;
    private detectCb: Promise<any>;
    private resolveCb: (any) => void;

    // sentinelFn -- returns true when something is detected
    // detectCb -- is run when sentinelFn returns true (once)
    // interval -- how often to run sentinelFn
    constructor(sentinelFn, interval: number, maxChecks: number) {
        this.maxChecks = maxChecks;
        this.sentinelFn = sentinelFn;
        this.detectCb = new Promise((resolve, reject) => {
            this.resolveCb = resolve;
        });
        this.check();
        this.intervalId = window.setInterval(() => {
            this.check();
        }, interval);
    }

    destroy() {
        clearInterval(this.intervalId);
    }

    async detected() {
        return this.detectCb;
    }

    private check() {
        this.checks += 1;
        new Promise(this.sentinelFn).then((x) => {
            //console.log(`calling check ${this.checks} ${new Date()}`);
            clearInterval(this.intervalId);
            this.resolveCb(x);
        }, () => {});
        if (typeof(this.maxChecks) !== 'undefined' && this.checks > this.maxChecks) {
            clearInterval(this.intervalId);
        }
    }
}

// starts the timer from 0
export class ResettableTimeout {
    private timeoutRef: number;
    private ran: boolean = false;

    constructor(private fn: () => void, private delay:number) {
        this.wrapper();
    }

    private wrapper() {
        this.timeoutRef = safeSetTimeout(() => {
            this.fn();
            this.ran = true;
        }, this.delay);
    }

    public reset() {
        if (!this.ran) {
            clearTimeout(this.timeoutRef);
            // just in case a race-condition is possible
            this.ran = false;
            this.wrapper();
        }
    }

    public clear() {
        clearTimeout(this.timeoutRef);
    }
}

export function instanceOfDynamicMatch(object: any): object is IDynamicMatch {
    return typeof object === 'object' && 'description' in object && 'fn' in object;
}

