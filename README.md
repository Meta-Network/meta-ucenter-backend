<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>


## Description

UCenter for Meta Network.

## Installation

```bash
# create your env file
$ touch .env
$ yarn install
```

## Running the app (choose one)

```bash
# Generate RSA Key for JWT signing
$ openssl genrsa -out JWT_PRIVATE_KEY.pem 1024

# Get RSA Public Key from the private key
$ openssl rsa -in JWT_PRIVATE_KEY.pem -pubout > JWT_PUBLIC_KEY.pub

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
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
