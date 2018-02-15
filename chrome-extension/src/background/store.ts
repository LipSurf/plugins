export interface IStoreHomophone {
    source: string,
    destination: string,
    enabled: boolean
}

export interface IStorePlugin {
    name: string,
    match: RegExp[],
    commands: IStoreCommand[],
    homophones: IStoreHomophone[],
    cs: string, // only made into a function when it is eval'd on the page
    enabled: boolean,
}

export interface IStoreCommand {
    name: string,
    description: string,
    run: () => any,
    runOnPage: string,
    nice: (match: string) => string,
    delay: Number[],
    match: ((transcript: string) => boolean) | string[],
    // computed property that describes if match strings have ordinal
    // placeholders and we should wait a bit of extra time to let
    // them get captured before executing
    _ordinalMatch: boolean,    
    enabled: boolean,
}

export class Store {
    private listeners: ((plugins?: IStorePlugin[]) => void)[] = [];
    private _plugins: IStorePlugin[];

    get plugins() {
        return this._plugins;
    }

    set plugins(plugins) {
        this._plugins = plugins;
        this.listeners.forEach((fn) => fn(this._plugins));
    }

    subscribe(fn: (plugins: IStorePlugin[]) => void) {
        this.listeners.push(fn);
    }
}

export let store = new Store();