/**
    @namespace Milo
    @module milo-core
    @class API
    @extends {Ember.Namespace}
*/
Milo.API = Em.Namespace.extend({
    _options: null,
    _headers: null,
    _queryParams: null,
    _adapter: null,
    _serializer: null,

    init: function () {
        this._super();
        this.set('_options', {});
        this.set('_headers', {});
        this.set('_queryParams', {});
        this.set('_adapter', Milo.DefaultAdapter.create());
        this.set('_serializer', Milo.DefaultSerializer.create());
    },

    /**
        @method options
        @param {String} key
        @param {String} value
    */
    options: function (key, value) {
        return Milo.Helpers.mapProperty.bind(this)('_options', key, value);
    },

    /**
        @method headers
        @param {String} key
        @param {String} value
    */
    headers: function (key, value) {
        return Milo.Helpers.mapProperty.bind(this)('_headers', key, value);
    },

    /**
        @method queryParams
        @param {String} key
        @param {String} value
    */
    queryParams: function (key, value) {
        return Milo.Helpers.mapProperty.bind(this)('_queryParams', key, value);
    },

    /**
        @method adapter
        @param {String} value
    */
    adapter: function (value) {
        return Milo.Helpers.propertyWrapper.bind(this)('_adapter', value);
    },

    /**
        @method serializer
        @param {String} value
    */
    serializer: function (value) {
        return Milo.Helpers.propertyWrapper.bind(this)('_serializer', value);
    }
});
