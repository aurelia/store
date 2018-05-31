# aurelia-store

[![npm Version](https://img.shields.io/npm/v/aurelia-store.svg)](https://www.npmjs.com/package/aurelia-store)
[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI](https://circleci.com/gh/aurelia/store.svg?style=shield)](https://circleci.com/gh/aurelia/store)
[![Coverage Status](https://coveralls.io/repos/github/aurelia/store/badge.svg?branch=master)](https://coveralls.io/github/aurelia/store?branch=master)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains a plugin that provides a single state store based on RxJS.
Various examples can be found in the [samples repository](https://github.com/zewa666/aurelia-store-examples)..

You can find complete documentation on setup and usage in the official [Aurelia Developer Hub](http://aurelia.io/hub.html#/doc/article/aurelia/store/latest/aurelia-store-plugin)

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.aurelia.io/) and [our email list](http://eepurl.com/ces50j). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions look around our [Discourse forums](https://discourse.aurelia.io/), chat in our [community on Gitter](https://gitter.im/aurelia/discuss) or use [stack overflow](http://stackoverflow.com/search?q=aurelia). Documentation can be found [in our developer hub](http://aurelia.io/docs). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome or Firefox Extension and visit any of our repository's boards.

## Dependencies

* [RxJS](https://github.com/ReactiveX/rxjs)
* aurelia-dependency-injection
* aurelia-framework
* aurelia-logging
* aurelia-pal

## Platform Support

This library can be used in the **browser** and **node**.

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. To build the code, you can now run:

  ```shell
  npm run build
  ```
4. You will find the compiled code in the `dist` folder, available in various module formats.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. For single execution run:

  ```shell
  npm run test
  ```
2. For continuous tdd style:

  ```shell
  npm run test-watch
  ```
3. You can find the coverage report built after each test run:

  ```shell
  cat /test/coverage-jest/index.html
  ```  
