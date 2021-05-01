# express-maintenance-mode

[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/dissfall/express-maintenance-mode.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/express-maintenance-mode.svg)](https://npm.im/express-maintenance-mode)

> Express middleware that allows you to put the server(s) in maintenance mode


## Table of Contents

* [Motivation](#motivation)
* [How it works](#how-it-works)
* [Install](#install)
* [Usage](#usage)
  * [Redis example](#redis-example)
* [API](#api)
* [Contributors](#contributors)
* [License](#license)


## Motivation

I developed this module because I needed an easy way to transfer all servers behind the load balancer
to maintenance mode with one API request. That is why I made methods for getting and setting external maintenance status.
In my production environment, I use these techniques to keep the service status in sync with Redis.
This way, all servers in the load balancing group are aware of the status update within a minute.


## How it works

Module provides simple api to control maintenance state.
Access to all middlewares below can be controlled by maintenance middleware


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

```typescript
import { ExpressMaintenanceMode } from 'express-maintenance-mode';

const maintenance = new ExpressMaintenanceMode<MaintenanceResponseBody>({
  maintenancePath: '/maintenance', // Path to control maintenance state
  apiBasePath: '/api', // Base path of your API
  accessKey: 'changeme', // Access key for maintenance endpoint. Works without authorization if not provided
  getExternalMaintenanceState: () => {
    // Optional
    // Your method to get external state
  },
  setExternalMaintenanceState: () => {
    // Optional
    // Your method to set external state
  },
  localMaintenanceStateTTL: 6000 // Lifetime of local maintenance state, until it be synced with external state
});

// Optional
interface MaintenanceResponseBody {
  message: string;
}

// App example

app.use(bodyParser.json());
app.use(maintenance.middleware)
// ...
app.use(yourGreatAPIRouter)


```

### Redis example

```typescript
import {MaintenanceState} from './index';

const getExternalMaintenanceState = async (): Promise<MaintenanceState<MaintenanceResponseBody>> => {
  return yourRedisDAO.get<MaintenanceState<MaintenanceResponseBody>>('maintenance');
}
  
const setExternalState = async (maintenanceState: MaintenanceState<MaintenanceResponseBody>) => {
  yourRedicDAO.save('maintenance', maintenanceState);
}
```


## API

To control maintenance status three methods available:

GET - to get maintenance status
POST - to set server in maintenance mode
DELETE - to set server in regular mode

Using POST method you can set response status code and body

Request body:

```json
{
  "statusCode": 503,
  "body": {
    "message": "Server in maintenance mode"
  }
}

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
