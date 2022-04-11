<p align="center">
  <img src="/images/logo.png" align="center">
</p>

<p align="center">A simple broker API implementation</p>

## Description

The **queuejs** is a simple broker API

## Running the app

### Local

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Docker

```bash
$ docker build -t queuejs .
$ docker run -it --rm --name queuejs -p 3000:3000 queuejs
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
