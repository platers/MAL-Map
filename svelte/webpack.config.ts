/**
 * Babel will compile modern JavaScript down to a format compatible with older browsers, but it will also increase your
 * final bundle size and build speed. Edit the `browserslist` property in the package.json file to define which
 * browsers Babel should target.
 *
 * Browserslist documentation: https://github.com/browserslist/browserslist#browserslist-
 */
const useBabel = true;

/**
 * This option controls whether or not development builds should be compiled with Babel. Change this to `true` if you
 * intend to test with older browsers during development, but it could significantly impact your build speed.
 */
const useBabelInDevelopment = false;

/**
 * Define paths to any stylesheets you wish to include at the top of the CSS bundle. Any styles compiled from svelte
 * will be added to the bundle after these. In other words, these are global styles for your svelte app. You can also
 * specify paths to SCSS or SASS files, and they will be compiled automatically.
 */
const stylesheets = [
	'./src/styles/index.scss'
];

/**
 * Change this to `true` to generate source maps alongside your production bundle. This is useful for debugging, but
 * will increase total bundle size and expose your source code.
 */
const sourceMapsInProduction = true;

/*********************************************************************************************************************/
/**********                                             Webpack                                             **********/
/*********************************************************************************************************************/

import Webpack from 'webpack';
import WebpackDev from 'webpack-dev-server';
import SveltePreprocess from 'svelte-preprocess';
import Autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';

import fs from 'fs';
import path from 'path';

const mode = process.env.NODE_ENV ?? 'development';
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

const config: Configuration = {
	mode: isProduction ? 'production' : 'development',
	entry: {
		bundle: [
			...stylesheets,
			'./src/main.ts'
		]
	},
	resolve: {
		alias: {
			// Note: Later in this config file, we'll automatically add paths from `tsconfig.compilerOptions.paths`
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.ts', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		fallback: {
			"child_process": false,
			"fs": false,
		}
	},
	output: {
		path: path.resolve(__dirname, 'public/build'),
		publicPath: '/build/',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			// Rule: Svelte
			{
				test: /\.svelte$/,
				// exclude: /node_modules/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							// Dev mode must be enabled for HMR to work!
							dev: isDevelopment
						},
						emitCss: isProduction,
						hotReload: isDevelopment,
						hotOptions: {
							// List of options and defaults: https://www.npmjs.com/package/svelte-loader-hot#usage
							noPreserveState: false,
							optimistic: true,
						},
						preprocess: SveltePreprocess({
							scss: true,
							sass: true,
							postcss: {
								plugins: [
									Autoprefixer
								]
							}
						})
					}
				}
			},

			// Required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
			// See: https://github.com/sveltejs/svelte-loader#usage
			{
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			},

			// Rule: SASS
			{
				test: /\.(scss|sass)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									Autoprefixer
								]
							}
						}
					},
					'sass-loader'
				]
			},

			// Rule: CSS
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
				]
			},

			// Rule: TypeScript
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	devServer: {
		hot: true,
		stats: 'errors-only',
		contentBase: 'public',
		watchContentBase: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*"
		}
	},
	target: isDevelopment ? 'web' : 'browserslist',
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],
	devtool: isProduction && !sourceMapsInProduction ? false : 'source-map',
	stats: {
		chunks: false,
		chunkModules: false,
		modules: false,
		assets: true,
		entrypoints: false
	}
};

/**
 * This interface combines configuration from `webpack` and `webpack-dev-server`. You can add or override properties
 * in this interface to change the config object type used above.
 */
export interface Configuration extends Webpack.Configuration, WebpackDev.Configuration {

}

/*********************************************************************************************************************/
/**********                                             Advanced                                            **********/
/*********************************************************************************************************************/

// Configuration for production bundles
if (isProduction) {
	// Clean the build directory for production builds
	config.plugins?.push(new CleanWebpackPlugin());

	// Minify CSS files
	config.optimization?.minimizer?.push(
		new CSSMinimizerPlugin({
			parallel: true,
			minimizerOptions: {
				preset: [
					'default',
					{
						discardComments: { removeAll: !sourceMapsInProduction },
					},
				],
			},
		})
	);

	// Minify and treeshake JS
	if (config.optimization === undefined) {
		config.optimization = {};
	}

	config.optimization.minimize = false;
}

// Parse as JSON5 to add support for comments in tsconfig.json parsing.
require('require-json5').replace();

// Load path aliases from the tsconfig.json file
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tsconfig = fs.existsSync(tsconfigPath) ? require(tsconfigPath) : {};

if ('compilerOptions' in tsconfig && 'paths' in tsconfig.compilerOptions) {
	const aliases = tsconfig.compilerOptions.paths;

	for (const alias in aliases) {
		const paths = aliases[alias].map((p: string) => path.resolve(__dirname, p));

		// Our tsconfig uses glob path formats, whereas webpack just wants directories
		// We'll need to transform the glob format into a format acceptable to webpack

		const wpAlias = alias.replace(/(\\|\/)\*$/, '');
		const wpPaths = paths.map((p: string) => p.replace(/(\\|\/)\*$/, ''));

		if (config.resolve && config.resolve.alias) {
			if (!(wpAlias in config.resolve.alias) && wpPaths.length) {
				config.resolve.alias[wpAlias] = wpPaths.length > 1 ? wpPaths : wpPaths[0];
			}
		}
	}
}

// Babel
if (useBabel && (isProduction || useBabelInDevelopment)) {
	const loader = {
		loader: 'babel-loader',
		options: {
			sourceType: 'unambiguous',
			presets: [
				[
					// Docs: https://babeljs.io/docs/en/babel-preset-env
					'@babel/preset-env',
					{
						debug: false,
						corejs: { version: 3 },
						useBuiltIns: 'usage'
					}
				]
			],
			plugins: ['@babel/plugin-transform-runtime']
		}
	};

	config.module?.rules.unshift({
		test: /\.(?:m?js|ts)$/,
		include: [
			path.resolve(__dirname, 'src'),
			path.resolve('node_modules', 'svelte')
		],
		exclude: [
			/node_modules[/\\](css-loader|core-js|webpack|regenerator-runtime)/
		],
		use: loader,
	});

	const svelte = config.module?.rules.find(rule => {
		if (typeof rule !== 'object') return false;
		else if (Array.isArray(rule.use))
			return rule.use.includes((e: any) => typeof e.loader === 'string' && e.loader.startsWith('svelte-loader'));
		else if (typeof rule.use === 'object')
			return rule.use.loader?.startsWith('svelte-loader') ?? false;
		return false;
	}) as Webpack.RuleSetRule;

	if (!svelte) {
		console.error('ERR: Could not find svelte-loader for babel injection!');
		process.exit(1);
	}

	if (!Array.isArray(svelte.use)) {
		svelte.use = [svelte.use as any];
	}

	svelte.use.unshift(loader);
}

export default config;
