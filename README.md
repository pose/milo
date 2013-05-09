##Milo.js

[![Build Status](https://travis-ci.org/mulesoft/milo.png?branch=master)](https://travis-ci.org/mulesoft/milo)

## Sample App

In `sample-ui` directory you can find an example about how to use Milo.js with an [Ember.js](http://emberjs.com/) application.
 
### Setup

1. Run `npm install -g brunch` to install [Brunch](http://brunch.io/).
2. Run `npm install .` inside the `sample-ui` directory to install the required dependencies.

### Running the sample

* Run `brunch watch --server`.
* The application will be available at [http://localhost:3333](http://localhost:3333).

## Building Milo.js

1. Run `npm install .` to fetch the necessary npm packages.
2. Run `grunt dist` to build Milo.js. Two builds will b e placed in the `dist` directory.
	* `milo.js` and `milo.min.js` - unminified and minified build of Milo.js

NOTE: Please be sure you already have installed [Node.js](http://nodejs.org/)

## How to Run Unit Tests

### Setup

In order to run the tests you need `mocha-phantomjs`. You can do it by installing:

1. Install [Node.js](http://nodejs.org/) with NPM.
2. Run `npm install -g grunt-cli.` to install [Grunt](http://gruntjs.com/getting-started).
3. Run `npm install .` inside the project root to install the required npm packages.

###  Running tests using Grunt

1. Go to the project root directory.
2. Run `grunt test`.

## Build documentation

* From your local repository, run `grunt doc`
* The documentation will be built into the `doc` directory
