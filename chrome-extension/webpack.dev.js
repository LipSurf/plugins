const merge = require('webpack-merge');
const webpack = require('webpack');
const {
    bgConfig, unMangledConfig,
} = require('./webpack.common.js');


let featureFlags = {
    DEBUG: JSON.stringify(true),
    // for manually forcing speech
    INCLUDE_SPEECH_TEST_HARNESS: JSON.stringify(true),
    CLEAR_SETTINGS: JSON.stringify(false),
    SKIP_TUTORIAL: JSON.stringify(false),
    AUTO_ON: JSON.stringify(false),
    PRETEND_FIRST_INSTALL: JSON.stringify(false),
};


let devCommon = {
    plugins: [
	new webpack.DefinePlugin(featureFlags),
	//new WebpackShellPlugin({onBuildEnd:['tests/plugins/test-plugins.sh']}),
    ]
};

module.exports = [
    merge(bgConfig, devCommon, {

    }),
    merge(unMangledConfig, devCommon, {

    }),
];
