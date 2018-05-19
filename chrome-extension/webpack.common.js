const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');


let common = {
	mode: "development",
	context: path.resolve(__dirname, 'src/'),
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, 'chrome-extension/dist/')
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".tag"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [{
					loader: 'ts-loader',
					options: { configFile: 'tsconfig.json' }
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
	},
};

let bgConfig = Object.assign({}, common, {
	entry: {
		background: './background/main.ts',
		options: './options.ts',
		tutorial: './tutorial.js',
	},
	plugins: [
		new ExtraWatchWebpackPlugin({
			dirs: [ 'src/plugins/' ],
		}),
		// kinda hacky (plugins will be compiled separately in the future)
		new WebpackShellPlugin({
			onBuildExit: './bin/compile-plugins.sh',
		})
	]
});

let unMangledConfig = Object.assign({}, common, {
	entry: {
		page: './page/main.ts',
		'frame-beacon': './page/frame-beacon.ts',
	},
	optimization: {
		concatenateModules: false,
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					mangle: false,
					compress: false,
					//compress: {
						//keep_classnames: true,
						//dead_code: false,
						//top_retain: ['PluginBase']
					//}
				}
			}),
		]
	},
});


module.exports = {
	bgConfig, unMangledConfig,
};
