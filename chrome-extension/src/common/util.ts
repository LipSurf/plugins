/// <reference path="../@types/cs-interface.d.ts" />
/// <reference path="../@types/plugin-interface.d.ts" />
const customArgumentsToken = Symbol("__ES6-PROMISIFY--CUSTOM-ARGUMENTS__");
let safeSetTimeout = typeof window === 'undefined' ? setTimeout : window.setTimeout;
export const timeout = ms => new Promise(res => safeSetTimeout(res, ms));

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
    // maxChecks == null means infinite checks
    constructor(sentinelFn, interval: number, maxChecks: number = null) {
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
        if (this.maxChecks !== null && this.checks > this.maxChecks) {
            clearInterval(this.intervalId);
        }
    }
}

// starts the timer from 0
export class ResettableTimeout {
    private timeoutRef: number;
    public hasRan: boolean = false;

    constructor(private fn: () => void, private delay:number) {
        this.wrapper();
    }

    private wrapper() {
        this.timeoutRef = safeSetTimeout(() => {
            this.hasRan = true;
            this.fn();
        }, this.delay);
    }

    public reset() {
        if (!this.hasRan) {
            clearTimeout(this.timeoutRef);
            // just in case a race-condition is possible
            this.hasRan = false;
            this.wrapper();
        }
    }

    public clear() {
        clearTimeout(this.timeoutRef);
    }
}

function getTypeOf (input) {

	if (input === null) {
		return 'null';
	}

	else if (typeof input === 'undefined') {
		return 'undefined';
	}

	else if (typeof input === 'object') {
		return (Array.isArray(input) ? 'array' : 'object');
	}

	return typeof input;

}

/*
 * Branching logic which calls the correct function to clone the given value base on its type.
 */
function cloneValue (value) {

	// The value is an object so lets clone it.
	if (getTypeOf(value) === 'object') {
		return quickCloneObject(value);
	}

	// The value is an array so lets clone it.
	else if (getTypeOf(value) === 'array') {
		return quickCloneArray(value);
	}

	// Any other value can just be copied.
	return value;

}

/*
 * Enumerates the given array and returns a new array, with each of its values cloned (i.e. references broken).
 */
function quickCloneArray (input) {
	return input.map(cloneValue);
}


function quickCloneObject (input) {

	const output = {};

	for (const key in input) {
		if (!input.hasOwnProperty(key)) { continue; }

		output[key] = cloneValue(input[key]);
	}

	return output;

}

function executeDeepMerge (target, _objects = []) {
	// Ensure we have actual objects for each.
	const objects = _objects.map(object => object || {});
	const output = target || {};

	// Enumerate the objects and their keys.
	for (let oindex = 0; oindex < objects.length; oindex++) {
		const object = objects[oindex];
		const keys = Object.keys(object);

		for (let kindex = 0; kindex < keys.length; kindex++) {
			const key = keys[kindex];
			const value = object[key];
			const type = getTypeOf(value);
			const existingValueType = getTypeOf(output[key]);

			if (type === 'object') {
				if (existingValueType !== 'undefined') {
					const existingValue = (existingValueType === 'object' ? output[key] : {});
					output[key] = executeDeepMerge({}, [existingValue, quickCloneObject(value)]);
				} else {
					output[key] = quickCloneObject(value);
				}
			} else if (type === 'array') {
				if (existingValueType === 'array') {
					const newValue = quickCloneArray(value);
					output[key] = newValue;
				} else {
					output[key] = quickCloneArray(value);
				}
			} else {
				output[key] = value;
			}
		}
	}

	return output;

}

export function objectAssignDeep(target, ...objects) {
    return executeDeepMerge(target, objects);
}

export function deepSet(obj: object, path: string, val: any) {
    let splitted = path.split('.');
    let i = 0;
    return splitted.reduce((memo, x) => {
        i += 1;
        if (i === splitted.length) {
            memo[x] = val;
            return obj;
        } else if (typeof memo[x] === 'undefined') {
            memo[x] = {};
        }
        return memo[x];
    }, obj);
}

// only checks vertical view for now
export function isInView($ele: JQuery<HTMLElement>) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $ele.offset().top;

    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
}

// TODO: can these just check for exactly a certain set of properties?
export function instanceOfDynamicMatch(object: any): object is IDynamicMatch {
    return typeof object === 'object' && 'description' in object && 'fn' in object;
}

// just a cmd without live text (for when showLiveText is off)
export function instanceOfCmdParcel(object: any): object is ICmdParcel {
    return typeof object === 'object' && 'cmdArgs' in object && 'cmdName' in object && !('text' in object);
}

export function instanceOfCmdLiveTextParcel(object: any): object is ICmdLiveTextParcel {
    return typeof object === 'object' && 'cmdArgs' in object && 'cmdName' in object && 'text' in object;
}

export function instanceOfTextParcel(object: any): object is ILiveTextParcel {
    return typeof object === 'object' && !('cmdName' in object) && !('toggleActivated' in object) && !('transcript' in object) && ('text' in object);
}

export function instanceOfTranscriptParcel(object: any): object is ITranscriptParcel {
    return typeof object === 'object' && 'text' in object && 'cmdName' in object && 'cmdPluginId' in object;
}

export function instanceOfCodeParcel(object: any): object is ICodeParcel {
    return typeof object === 'object' && 'code' in object;
}
