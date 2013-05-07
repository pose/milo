var _mapProperty = function (property, key, value) {
        if ('undefined' === typeof value && 'string' === typeof key) {
            return this.get(property)[key];
        } else if ('undefined' === typeof value && 'object' === typeof key) {
            this.set(property, $.extend({}, this.get(property), key));
        } else {
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
    };

Milo.API = Em.Namespace.extend({
    _options: null,
    _headers: null,
    _queryParams: null,
    _adapter: null,
    _serializer: null,

    init: function () {
        this.set('_options', {});
        this.set('_headers', {});
        this.set('_queryParams', {});
        this.set('_adapter', Milo.DefaultAdapter.create());
        this.set('_serializer', Milo.DefaultSerializer.create());
    },

    options: function (key, value) {
        return _mapProperty.bind(this)('_options', key, value);
    },

    headers: function (key, value) {
        return _mapProperty.bind(this)('_headers', key, value);
    },

    queryParams: function (key, value) {
        return _mapProperty.bind(this)('_queryParams', key, value);
    },

    adapter: function (value) {
        return _propertyWrapper.bind(this)('_adapter', value);
    },

    serializer: function (value) {
        return _propertyWrapper.bind(this)('_serializer', value);
    }
});
