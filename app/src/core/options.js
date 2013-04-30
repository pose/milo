/**
@module milo-core
*/


var OptionsClass = Em.Object.extend({
    baseUrl: (function () {
        var _baseUrl;
        return function (key, value) {
            var validScheme = ['http://', 'https://'].map(function (e) {
                if (value) {
                    return value.indexOf(e) === 0;
                }
                return false;
            }).reduce(function (x,y) {
                return x || y;
            }, false);
            if (value && typeof value === 'string' && validScheme) {
                _baseUrl = value;
                return value;
            }

            throw 'Protocol "' + value + '" not supported.';
        }.property();
    })()
});

/**
@class Options
@namespace Milo
*/
Milo.Options = OptionsClass.create({
    auth: null
});
