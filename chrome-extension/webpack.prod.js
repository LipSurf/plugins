const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackClearConsole = require("webpack-clear-console").WebpackClearConsole;
const {
    bgConfig, unMangledConfig, pluginsConfig,
} = require('./webpack.common.js');


let featureFlags = {
	DEBUG: JSON.stringify(false),
	// for manually forcing speech
	INCLUDE_SPEECH_TEST_HARNESS: JSON.stringify(false),
	CLEAR_SETTINGS: JSON.stringify(false),
	AUTO_ON: JSON.stringify(false),
	PRETEND_FIRST_INSTALL: JSON.stringify(false),
	SKIP_TUTORIAL: JSON.stringify(false),
};

let prodCommon = {
    mode: "production",
    plugins: [
		new webpack.DefinePlugin(featureFlags),
		//new WebpackShellPlugin({onBuildEnd:['tests/plugins/test-plugins.sh']}),
    ]
};


module.exports = [
    Object.assign({}, bgConfig, prodCommon, {
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        mangle: {
                            reserved: ['PluginBase', 'document', 'window', 'riot'],
                            toplevel: false,
                            // properties: {
                            //     debug: "",
                            //     reserved: [],
                            // },
                        },
                        compress: {
                            //keep_classnames: false,
                            top_retain: ['PluginBase', 'riot'],
                            drop_console: true,
                        },
                    },
                }),
            ],
        }
    }),
     merge(unMangledConfig, prodCommon, {

     }),
    // uglify js can clear console but it throws an error "cannot read property line of undefined currently"
     merge(pluginsConfig, {
         plugins: [
            new WebpackClearConsole(),
        ],
     }),
];

