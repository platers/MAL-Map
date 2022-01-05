# Svelte Webpack Starter

A starter template for [Svelte](https://svelte.dev) that comes preconfigured with Webpack, TypeScript, SCSS, Babel,
Autoprefixer, and HMR.

- [Getting started](#getting-started)
	- [Installation](#installation)
	- [Starting the development server](#starting-the-development-server)
	- [Building for production](#building-for-production)
	- [Running in production](#running-in-production)
- [Usage](#usage)
	- [Global stylesheets](#global-stylesheets)
	- [Single page applications](#single-page-applications)
	- [Browsers list](#browsers-list)
	- [Babel customization](#babel-customization)
	- [Source maps in production](#source-maps-in-production)
	- [Import path aliases](#import-path-aliases)

---

## Getting started

### Installation

Pull the template files with [`degit`](https://github.com/Rich-Harris/degit) and install dependencies.

**🚀 Webpack 5 (recommended)**

```bash
npx degit baileyherbert/svelte-webpack-starter
npm install
```

**🚀 Webpack 4**

```bash
npx degit baileyherbert/svelte-webpack-starter#4
npm install
```

### Starting the development server

Run the `dev` script to start a live development server with hot module replacement. Then check the output for a link
to the app, which is usually `http://localhost:8080/`:

```bash
npm run dev
```

### Building for production

Run the `build` script to bundle the app for production. The bundle will be created at `/public/build/` and the `public`
directory will contain all files you need to host the app:

```bash
npm run build
```

> 💡 **Tip:** You can quickly test the production build by running `npm start` locally.

### Running in production

First upload the following files and folders to your target server:

- `package.json`
- `package-lock.json`
- `public`

Then install dependencies:

```bash
npm install --production
```

Finally run the `start` command to launch the included web server:

```bash
npm start
```

---

## Usage

### Global stylesheets

Add one or more global stylesheets to the bundle by editing the `stylesheets` variable at the top of
`webpack.config.ts`:

```ts
const stylesheets = [
    './src/styles/index.scss'
];
```

You can specify `css`, `scss`, and `sass` files here, and they will be compiled and minified as necessary. These styles
will be added to the beginning of the bundle in the order specified. Svelte's styles will always appear last.

### Single page applications

For single page applications that use history routing instead of hash routing, edit the `package.json` file to serve
the `index.html` file when a requested file is not found:

- Add the `--history-api-fallback` flag to the `"dev"` command
- Add the `--single` flag to the `"start"` command.

```json
"scripts": {
    "dev": "webpack serve --history-api-fallback",
    "start": "serve public --listen 8080 --single",
}
```

### Browsers list

The bundle will be compiled to run on the browsers specified in `package.json`:

```json
"browserslist": [
    "defaults"
]
```

The default value is recommended. If you wish to customize this, please refer to the list of
[example browserslist queries](https://github.com/browserslist/browserslist#full-list).

> 💡 **Note:** This template includes `core-js` and `regenerator-runtime` which means your source code will be
> transpiled and polyfilled to run on old browsers automatically.

### Babel customization

Production builds are compiled with Babel automatically. If you wish to disable it, edit the `webpack.config.ts` file:

```ts
const useBabel = false;
```

Babel is disabled during development in order to improve build speeds. Please enable it manually if you need:

```ts
const useBabelInDevelopment = true;
```

### Source maps in production

Source maps are generated automatically during development. They are not included in production builds by default. If
you wish to change this behavior, edit the `webpack.config.ts` file:

```ts
const sourceMapsInProduction = true;
```

### Import path aliases

Define import path aliases from the `tsconfig.json` file. For example:

```json
"paths": {
    "@stores/*": ["src/stores/*"]
}
```

You can then import files under these aliases and Webpack will resolve them. Your code editor should also use them
for automatic imports:

```ts
import { users } from '@stores/users'; // src/stores/users.ts
```

The root directory is configured as a base path for imports. This means you can also import modules with an absolute
path from anywhere in the project instead of using a large number of `..` to traverse directories.

```ts
import { users } from 'src/stores/users';
```
