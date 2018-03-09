import * as _ from "lodash";

export class PluginSandbox {
    private privilegedCode: object = {};

    addCommands(pluginName: string, commands) {
        this.privilegedCode[pluginName] = this.privilegedCode[pluginName] || {};
        this.privilegedCode = _.reduce(commands, (memo, runStr, name) => {
            memo[pluginName][name] = eval(runStr);
            return memo;
        }, this.privilegedCode);
    }

    run(cmdName: string, cmdPluginName: string, cmdArgs: any[]) {
        if (this.privilegedCode[cmdPluginName] && this.privilegedCode[cmdPluginName][cmdName]) {
            // run that bitch
            return this.privilegedCode[cmdPluginName][cmdName].apply(this, cmdArgs);
        }
    }

}
