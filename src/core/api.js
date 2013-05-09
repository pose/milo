var _mapProperty = function (property, key, value) {
        if ('undefined' === typeof key) {
            return this.get(property);
        } else if ('undefined' === typeof value && 'string' === typeof key) {
            return this.get(property)[key];
        } else if ('undefined' === typeof value && 'object' === typeof key) {
            if (key.baseUrl) {
                _baseUrlValidation(key.baseUrl);
            }
            this.set(property, $.extend({}, this.get(property), key));
        } else {
            if ('baseUrl' === key) {
                _baseUrlValidation(value);
            }
            this.get(property)[key] = value;
            return value;
        }
    },
    _propertyWrapper = function (property, value) {
        if ('undefined' === typeof value) {
            return this.get(property);
        } else {
          this.set(property, value);
          return value;
        }
    },
    _baseUrlValidation = function (value) {
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
    };

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
        return _mapProperty.bind(this)('_options', key, value);
    },

    /**
        @method headers
        @param {String} key
        @param {String} value
    */
    headers: function (key, value) {
        return _mapProperty.bind(this)('_headers', key, value);
    },

    /**
        @method queryParams
        @param {String} key
        @param {String} value
    */
    queryParams: function (key, value) {
        return _mapProperty.bind(this)('_queryParams', key, value);
    },

    /**
        @method adapter
        @param {String} value
    */
    adapter: function (value) {
        return _propertyWrapper.bind(this)('_adapter', value);
    },

    /**
        @method serializer
        @param {String} value
    */
    serializer: function (value) {
        return _propertyWrapper.bind(this)('_serializer', value);
    }
});
