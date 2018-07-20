const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader')


let common = {
	mode: "development",
	context: path.resolve(__dirname, 'src/'),
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, 'chrome-extension/dist/')
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".vue"],
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.tsx?$/,
				use: [{
					loader: 'ts-loader',
					options: {
						configFile: 'tsconfig.json',
						appendTsSuffixTo: [/\.vue$/]
					 }
				}]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.css$/,
				oneOf: [
				  // this applies to <style module>
				  {
					resourceQuery: /module/,
					use: [
					  'vue-style-loader',
					  {
						loader: 'css-loader',
						options: {
						  modules: true,
						  localIdentName: '[local]_[hash:base64:8]'
						}
					  }
					]
				  },
				  // this applies to <style> or <style scoped>
				  {
					use: [
					  'vue-style-loader',
					  'css-loader'
					]
				  }
				]
			},
		]
	},
	plugins: [
		new VueLoaderPlugin()
	],
};

let bgConfig = Object.assign({}, common, {
	entry: {
		background: './background/main.ts',
		options: './options.ts',
		tutorial: './tutorial.ts',
	},
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
