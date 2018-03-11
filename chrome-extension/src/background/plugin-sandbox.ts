import * as _ from "lodash";
import { store } from "./store";
import { ExtensionUtil } from "./util";

interface IPrivilegedCode {
    string: {
        string: () => any
    }
}

export class PluginSandbox {
    private privilegedCode: IPrivilegedCode;

    constructor() {
        this.privilegedCode = <IPrivilegedCode>{};
        store.subscribe((plugins) => {
            plugins.forEach((plugin) => {
                this.addCommands(plugin.name, plugin.commands)
            })
        })
    }

    private addCommands(pluginName: string, commands: IStoreCommand[]) {
        // overwrites existing commands for plugin
        this.privilegedCode[pluginName] = _.reduce(commands, (memo, cmd) => {
            memo[cmd.name] = cmd.run;
            return memo;
        }, {});
    }

    run(cmdPluginName: string, cmdName: string, cmdArgs: any[]) {
        if (this.privilegedCode[cmdPluginName] && this.privilegedCode[cmdPluginName][cmdName]) {
            // run that bitch
            return this.privilegedCode[cmdPluginName][cmdName].apply(this, cmdArgs);
        }
    }

}
