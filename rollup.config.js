import html from 'rollup-plugin-html';
import typescript from 'rollup-plugin-typescript';
import { terser } from "rollup-plugin-terser";
import multiEntry from "rollup-plugin-multi-entry";
import globby from 'globby';

const PROD = process.env.NODE_ENV === 'production';
let FOLDER_REGX = /^src\/(.*)\/.*$/;

let exports = globby.sync(['src/**/*.ts', '!src/@types', '!src/**/*.*.ts']).map(fileName => {
	let regxRes = FOLDER_REGX.exec(fileName);
	let folderName = regxRes ? regxRes[1] : null;
	if (folderName) {
		return {
			input: `src/${folderName}/*.ts`,
			plugins: [
				multiEntry(),
				typescript(),
				html({
					include: '**/*.html',
					htmlMinifierOptions: {
						collapseWhitespace: true,
						collapseBooleanAttributes: true,
						conservativeCollapse: true,
						minifyJS: true,
						minifyCSS: true,
						removeComments: true,
					}
				}),
				PROD && terser({
					mangle: false,
					compress: {
						pure_funcs: [
							'console.log',
							'console.dir',
						]
					}
				})
			],
			experimentalCodeSplitting: true,
			output: {
				file: `dist/${folderName}.mjs`,
				format: 'esm',
			}
		}
	}
}).filter(a => a);
export default exports;
