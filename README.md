# express-maintenance-mode

[![build status](https://img.shields.io/travis/com/dissfall/express-maintenance-mode.svg)](https://travis-ci.com/dissfall/express-maintenance-mode)
[![code coverage](https://img.shields.io/codecov/c/github/dissfall/express-maintenance-mode.svg)](https://codecov.io/gh/dissfall/express-maintenance-mode)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/dissfall/express-maintenance-mode.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/express-maintenance-mode.svg)](https://npm.im/express-maintenance-mode)

> Express middleware that allows you to put the server(s) in maintenance mode


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install express-maintenance-mode
```

[yarn][]:

```sh
yarn add express-maintenance-mode
```


## Usage

```js
const ExpressMaintenanceMode = require('express-maintenance-mode');

const expressMaintenanceMode = new ExpressMaintenanceMode();

console.log(expressMaintenanceMode.renderName());
// script
```


## Contributors

| Name                |
| ------------------- |
| **George Lykuanov** |


## License

[Apache-2.0](LICENSE) © George Lykuanov


##

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/
