/// <reference path="../@types/cs-interface.d.ts"/>
// @ts-ignore: ExtensionUtil is used by things that are eval'd
import { Store, StoreSynced, IOptions } from "./store";
let { ExtensionUtil } = require('../common/browser-interface');

interface IPrivilegedCode {
    string: {
        string: () => any
    }
}

export class PluginSandbox extends StoreSynced {
    private privilegedCode: IPrivilegedCode;

    protected init() {
        this.privilegedCode = <IPrivilegedCode>{};
    }

    protected storeUpdated(newOptions: IOptions) {
        newOptions.plugins.forEach((plugin) => {
            // overwrites existing commands for plugin
            this.privilegedCode[plugin.id] = Object.keys(plugin.commands).reduce((memo, cmdName) => {
                if (plugin.commands[cmdName].run)
                    // eval in the sandbox -- to make sure ExtensionUtil is defined
                    eval(`memo[cmdName] = ${plugin.commands[cmdName].run}`);
                return memo;
            }, {});
        })
    }

    run(parcel: ICmdParcel) {
        if (this.privilegedCode[parcel.cmdPluginId] && this.privilegedCode[parcel.cmdPluginId][parcel.cmdName]) {
            // run that bitch
            return this.privilegedCode[parcel.cmdPluginId][parcel.cmdName].apply(this, parcel.cmdArgs);
        }
    }

}
