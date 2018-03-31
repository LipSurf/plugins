/// <reference path="../@types/cs-interface.d.ts"/>
// @ts-ignore: ExtensionUtil is used by things that are eval'd
import { ExtensionUtil } from "./util";
import { Store, StoreSynced, IPluginConfig, IPluginConfigCommand } from "./store";

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

    protected storeUpdated(newPluginsConfig: IPluginConfig[]) {
        newPluginsConfig.forEach((plugin) => {
            // overwrites existing commands for plugin
            this.privilegedCode[plugin.id] = plugin.commands.reduce((memo, cmd) => {
                if (cmd.run)
                    memo[cmd.name] = cmd.run;
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