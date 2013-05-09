/**
    @namespace Milo
    @module milo-dsl
    @class UriTemplate
*/
Milo.UriTemplate = function (template, options) {
    options = options || {};

    return function () {
        return template;
    }.property().meta(options);
};