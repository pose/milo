# emberjs-template-with-scaffold
A new and up-to-date [Brunch](http://brunch.io) skeleton for developing [Ember.js](http://emberjs.com) applications based on the template [brunch-with-ember-reloaded](https://github.com/gcollazo/brunch-with-ember-reloaded) created by [Giovanni Collazo](https://github.com/gcollazo).
This skeleton uses JavaScript instead of CoffeScript for scaffolt generators.

## Versions
- [Ember v1.0.0-rc.3](http://emberjs.com)
- [Handlebars 1.0.0-rc.3](http://handlebarsjs.com)
- [jQuery v1.9.1](http://jquery.com)
- [HTML5 Boilerplate v4.2.0](http://html5boilerplate.com)

## Features
- **CoffeeScript** - a little language that compiles into JavaScript.
- **Stylus** - Expressive, dynamic, robust CSS pre-processor.
- **auto-reload-brunch** - Adds automatic browser reloading support to brunch.
- **uglify-js-brunch** - Adds UglifyJS support to brunch.

## Getting started

```
brunch new <appname> --skeleton git@github.com:AlejoFernandez/emberjs-template-with-scaffold.git
cd <appname>
brunch watch -s
```
Open [http://localhost:3333](http://localhost:3333) on your browser.

### Generators
This skeleton makes use of [scaffolt](https://github.com/paulmillr/scaffolt#readme) generators to help you create common files quicker. To use first install scaffolt globally with `npm install -g scaffolt`. Then you can use the following command to generate files.

```
scaffolt model <name> 				→ app/models/name.js			NameModel class
scaffolt view <name>				→ app/views/name.js			NameView class
scaffolt controller <name> 			→ app/controllers/name.js	NameController class
scaffolt route <name> 				→ app/routes/name.js			NameRoute class
scaffolt template <name> 			→ app/templates/name.hbs
```
It also adds a require to the newly created file in the app root folder inside the correspondent js file (models.js, routes.js, etc.).

There's a few more commands you can use with scaffolt and also instruction on how to create your own generators, so make sure you check out the [docs](https://github.com/paulmillr/scaffolt#readme).


## License
All of emberjs-template-with-scaffold is licensed under the MIT license.

Copyright (c) 2013 Alejo Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
