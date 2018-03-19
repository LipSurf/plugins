/// <reference path="../@types/cs-interface.d.ts"/>
import * as _ from "lodash";
// @ts-ignore: ExtensionUtil is used by things that are eval'd
import { ExtensionUtil } from "./util";
import { Store } from "./store";

interface IPrivilegedCode {
    string: {
        string: () => any
    }
}

export class PluginSandbox {
    private privilegedCode: IPrivilegedCode;

    constructor(private store: Store) {
        this.store = store;
        this.privilegedCode = <IPrivilegedCode>{};
        this.store.subscribe((plugins) => {
            plugins.forEach((plugin) => {
                this.addCommands(plugin.id, plugin.commands)
            })
        })
    }

    private addCommands(pluginId: string, commands: IStoreCommand[]) {
        // overwrites existing commands for plugin
        this.privilegedCode[pluginId] = _.reduce(commands, (memo, cmd) => {
            memo[cmd.name] = cmd.run;
            return memo;
        }, {});
    }

    run(parcel: ICmdParcel) {
        if (this.privilegedCode[parcel.cmdPluginId] && this.privilegedCode[parcel.cmdPluginId][parcel.cmdName]) {
            // run that bitch
            return this.privilegedCode[parcel.cmdPluginId][parcel.cmdName].apply(this, parcel.cmdArgs);
        }
    }

}
