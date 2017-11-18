exports.PS = function({
	chrome,
	_,
	Util, // TODO: change to nhm util
} = {}) {
	var pub = {};
    var privilegedCode = {};

    pub.addCommands = function(pluginName, commands) {
    	privilegedCode[pluginName] = privilegedCode[pluginName] || {};
    	privilegedCode = _.reduce(commands, (memo, runStr, name) => {
    		memo[pluginName][name] = eval(runStr);
    		return memo;
    	}, privilegedCode);
    };

    pub.run = function({
        cmdName,
        cmdPluginName,
        cmdArgs,
    }) {
        if (privilegedCode[cmdPluginName] && privilegedCode[cmdPluginName][cmdName]) {
            // run that bitch
			return privilegedCode[cmdPluginName][cmdName].apply(this, cmdArgs);
		}
	};

	return pub;
};