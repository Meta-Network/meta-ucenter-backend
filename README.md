## Description

UCenter for Meta Network.

## Installation

```bash
# create your env file
$ touch .env
$ yarn install
```

## Running the app (choose one)

First you have to setup the config files, include following:

```
config
|____config.production.yaml   # for production mode
|____config.biz.production.yaml  # as well as above
|____config.development.yaml  # for development mode
|____config.biz.development.yaml  # as well as above
|____rds-ca-2019-root.pem
|____JWT_PUBLIC_KEY.pub
|____JWT_PRIVATE_KEY.pem
```

If you're running in **docker-compose**, you need to setup these files within docker config path, default as:

```
/var/docker/meta-ucenter/config
```

Here's how to generate JWT key files:

```bash
# Generate RSA Key for JWT signing and get RSA Public Key from the private key
$ yarn run keygen

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Docker

You can build a [Docker](https://www.docker.com/) image with `docker build` command as following:

```bash
yarn build # or npm run build
docker build -t metaio/ucenter:latest .
```

Then to start up the image, you can use [Docker compose](https://docs.docker.com/compose/), with simply:

```bash
docker-compose up
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Conventional Commits

This project is following [commitlint](https://github.com/conventional-changelog/commitlint) rules and checks the commit message with [husky](https://typicode.github.io/husky/#/?id=features). You can also follow the [Local setup](https://commitlint.js.org/#/guides-local-setup) installation guide to install this lint in your project, like following:

```bash
# Install and configure if needed
npm install --save-dev @commitlint/{cli,config-conventional}
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Install Husky v6
npm install husky --save-dev
# or
yarn add husky --dev

# Active hooks
npx husky install
# or
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
# or
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```
