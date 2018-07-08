const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {
    bgConfig, unMangledConfig,
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
    merge(bgConfig, prodCommon, {
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        mangle: {
                            reserved: ['document', 'window', 'riot'],
                            toplevel: false,
                            // properties: {
                            //     debug: "",
                            //     reserved: [],
                            // },
                        },
                        compress: {
                            //keep_classnames: false,
                            top_retain: ['riot'],
                            drop_console: true,
                        },
                    },
                }),
            ],
        }
    }),
     merge(unMangledConfig, prodCommon, {
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        mangle: false,
                        compress: {
                            pure_funcs: ['console.log'],
                        },
                    },
                }),
            ],
        }
     }),
];

