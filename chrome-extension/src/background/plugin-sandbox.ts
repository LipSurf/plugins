import * as _ from "lodash";
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
