const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');


function getRules(configFile) {
	return {
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [{
						loader: 'ts-loader',
						options: { configFile }
					}]
				}
			]
		},
	};
}

let featureFlags = {
	DEBUG: JSON.stringify(true),
	// for manually forcing speech
	INCLUDE_SPEECH_TEST_HARNESS: JSON.stringify(true),
	CLEAR_SETTINGS: JSON.stringify(true),
	AUTO_ON: JSON.stringify(true),
};

let common = {
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".tag"],
	},
	plugins: [
		new webpack.DefinePlugin(featureFlags),
		//new WebpackShellPlugin({onBuildEnd:['tests/plugins/test-plugins.sh']}),
	]

	//optimization: {
		//minimizer: [
			//new UglifyJsPlugin({
				//uglifyOptions: {
					//mangle: false,
					//compress: false
					//compress: {
						//keep_classnames: true,
						//dead_code: false,
						//top_retain: ['PluginBase']
					//}
				//}
			//}),
		//]
	//}
};

let bgConfig = Object.assign({}, common, {
	entry: './src/background/main.ts',
	output: {
		path: path.resolve(__dirname, 'chrome-extension/dist'),
		filename: 'background.js'
	},
}, getRules('tsconfig.background.json'));

//let optionsRules = getRules('tsconfig.options.json');
//Array.prototype.unshift(optionsRules.module.rules,[{
let optionsRules = {module: {
	rules: [
		{
			test: /\.tsx?$/,
			use: [{
				loader: 'ts-loader',
				options: { configFile: 'tsconfig.options.json' }
			}]
		},
		{
			test: /\.tag$/,
			include: path.resolve(__dirname, 'src/tags'),
			use: [{
				loader: 'riot-tag-loader',
				query: {
					type: 'es6',
					hot: false
				}
			}]
		},
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: ['babel-loader']
		},
	]
}};
//{
	//test: /\.js$/,
	//include: path.resolve(__dirname, 'src/tags'),
	//use: ['babel-loader']
//}

let commonPageConfig = Object.assign({}, common, {
	optimization: {
		concatenateModules: false,
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					mangle: false,
					compress: false
					//compress: {
						//keep_classnames: true,
						//dead_code: false,
						//top_retain: ['PluginBase']
					//}
				}
			}),
		]
	}
});

let optionsConfig = Object.assign({}, common, {
	entry: './src/options.ts',
	output: {
		path: path.resolve(__dirname, 'chrome-extension/dist'),
		filename: 'options.js'
	}
}, optionsRules);

let riotConfig = Object.assign({}, commonPageConfig, {
	entry: './src/tags/options-page.tag',
	output: {
		path: path.resolve(__dirname, 'chrome-extension/dist'),
		filename: 'tags.js'
	}
}, optionsRules);


let pageMainConfig = Object.assign({}, commonPageConfig, {
	entry: './src/page/main.ts',
	output: {
		path: path.resolve(__dirname, 'chrome-extension/dist/page/'),
		filename: 'main.js',
	},
}, getRules('tsconfig.page-main.json'));

// loaded as a cs on the page
//let pluginLibraryConfig = Object.assign({}, commonPageConfig, {
	//entry: './src/page/main.ts',
	//output: {
		//path: path.resolve(__dirname, 'chrome-extension/dist/page/'),
		//filename: 'main.js',
		//library: 'myLibrary',
        //libraryTarget: 'var'
	//},
	//plugins: []
//});

let pageFrameBeaconConfig = Object.assign({}, commonPageConfig, {
	entry: './src/page/frame-beacon.ts',
	output: {
		path: path.resolve(__dirname, 'chrome-extension/dist/page/'),
		filename: 'frame-beacon.js'
	}
}, getRules('tsconfig.page-frame-beacon.json'));

let pluginsConfig = Object.assign({}, commonPageConfig, {
	context: path.resolve(__dirname, 'src/plugins/'),
	devtool: false,
	entry: {
		google: './google.ts',
		browser: './browser.ts',
		reddit: './reddit.ts'
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, 'chrome-extension/dist/plugins'),
		libraryTarget: 'window'
	}
}, getRules('tsconfig.plugins.json'));


module.exports = [
	bgConfig, pageMainConfig, pageFrameBeaconConfig, optionsConfig, pluginsConfig,
]
