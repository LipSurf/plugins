import {storage} from "../common/browser-interface";

export class Store {
    private listeners: ((plugins?: IStorePlugin[]) => void)[] = [];
    private _plugins: IStorePlugin[];

    get plugins() {
        return this._plugins;
    }

    set plugins(plugins: IStorePlugin[]) {
        this._plugins = plugins;
        this.listeners.forEach((fn) => fn(this._plugins));
        storage.local.save({'store-plugin': plugins});
    }

    subscribe(fn: (plugins: IStorePlugin[]) => void) {
        this.listeners.push(fn);
    }
}

export let store = new Store();
