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
