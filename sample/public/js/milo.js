window.Milo = Em.Namespace.create({
    revision: 1
});
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

Milo.UriTemplate = function (template, options) {
    options = options || {};

    return function () {
        return template;
    }.property().meta(options);
};
Milo.collection = function (type, options) {
    options = options || {};

    return Ember.computed(function (key, value, oldValue) {
        var parentName = this.constructor.toString(),
            periodIndex = parentName.indexOf('.'),
            param = '%@Id'.fmt(parentName.substring(periodIndex + 1, parentName.length)).camelize(),
            findParams = {};

        findParams[param] = this.get('id');

        return type.find(findParams).toArray();
    }).property().volatile().meta(options);
};
Milo.property = function (type, options) {
    options = options || {};

    return Ember.computed(function (key, value, oldValue) {
        var temp = this.get('data').findProperty('key', key);

        if (!temp) {
            temp = this.get('data').pushObject(Em.Object.create({
                key: key,
                value: value,
                orig: value
            }));
        } else {
            temp.value = value;
        }

        if (oldValue) {
            this.set('isDirty', true);
        }

        return temp.value;
    }).property().meta(options);
};
/**
@module milo-core
*/

/**
@class Deferred
@namespace Milo
*/
Milo.Deferred = Em.Mixin.create({
  /**
    This method will be called when the  ...

    @method done
    @return {Milo.Deferred}
  */
  done: function (callback) {
    this.get('deferred').done(callback);
    return this;
  },

  /**
    This method will be called when the  ...

    @method fail
    @return {Milo.Deferred}
  */
  fail: function (callback) {
    this.get('deferred').fail(callback);
    return this;
  }
});
/**
@module milo-core
*/

/**
@class Proxy
@namespace Milo
*/
Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
	isLoading: null,
	rollback: function () {
		this.content.rollback();
	}
});
/**
@module milo-core
*/

/**
@class ArrayProxy
@namespace Milo
*/
Milo.ArrayProxy = Em.ArrayProxy.extend(Milo.Deferred, {
	isLoading: null
});
Milo.DefaultAdapter = Em.Mixin.create({
    execQuery: function (proxy) {
        var params,
        url = Milo.Options.get('baseUrl').fmt(this.get('resourceUrl'));

        proxy.set('isLoading', true);

        params = $.param($.extend({},
        this.get('orderByClause'),
        this.get('anyClause'),
        this.get('takeClause'),
        Milo.Options.get('auth')));

        return $.get(url + '?' + params).always(function () {
            proxy.set('isLoading', false);
        });
    },

    resourceUrl: function () {
        var metaMap = {};
        this.constructor.eachComputedProperty(function (key, value) {
            metaMap[key] = value;
        });

        if (!metaMap.uriTemplate) {
            throw "Error: uriTemplate not set in model " + this.constructor;
        }

        var meta = metaMap.uriTemplate, resourceUrl;

        if (meta.namedParams) {
            var params = [];

            meta.namedParams.forEach(function (param) {
                if (this.get('anyClause')[param]) {
                    params.push(this.get('anyClause')[param]);

                    this.get('meta')[param] = this.get('anyClause')[param];

                    delete this.get('anyClause')[param];
                }
            }.bind(this));

            resourceUrl = Em.String.fmt(this.get('uriTemplate'), params);
        } else if (this.get('anyClause').id) {
            resourceUrl = this.get('uriTemplate').fmt(this.get('anyClause').id);
            delete this.get('anyClause').id;
        } else {
            resourceUrl = this.get('uriTemplate').fmt();
        }

        if (resourceUrl.charAt(resourceUrl.length - 1) === '/') {
            resourceUrl = resourceUrl.substring(resourceUrl.length - 1, 0);
        }

        return resourceUrl;
    }.property().volatile()
});

/**
@module milo-core
*/

var _validateNumber = function (count) {
    if (typeof count !== 'number' || count < 0) {
        throw 'Invalid index "' + count + '"';
    }
};

var _validateString = function (fieldName) {
    if (typeof fieldName !== 'string') {
        throw 'Ordering field must be a valid string';
    }
};


/**
@class Queryable
@namespace Milo
*/
Milo.Queryable = Em.Mixin.create({
    orderBy: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'asc'
        });

        return this;
    },

    orderByDescending: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'desc'
        });

        return this;
    },

    take: function (count) {
        _validateNumber(count);
        this.set('takeClause', {
            limit: count
        });

        return this;
    },

    skip: function (count) {
        _validateNumber(count);
        this.set('skipClause', {
            offset: count
        });

        return this;
    },

    find: function (clause) {
        this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

        return this;
    },

    single: function () {
        var proxy = Milo.Proxy.create({
            deferred: $.Deferred()
        });

        this.execQuery(proxy).done(function (data) {
            var content = this.constructor.create($.extend({}, this.get('meta'), data));
            //// TODO: Throw an exception if data.lenght > 1
            proxy.set('content', content);

            proxy.get('deferred').resolve(proxy);
        }.bind(this));

        return proxy;
    },

    toArray: function () {
        var results = Em.A(),
            proxy = Milo.ArrayProxy.create({
                deferred: $.Deferred()
            });

        this.execQuery(proxy).done(function (data) {
            data[this.get('rootElement')].forEach(function (value) {
                var result = this.constructor.create($.extend({}, this.get('meta'), value));

                results.pushObject(result);
            }.bind(this));

            proxy.set('content', results);

            proxy.get('deferred').resolve(proxy);
        }.bind(this));

        return proxy;
    }
});

Milo.Model = Em.Object.extend(Milo.Queryable, Milo.DefaultAdapter, {
    meta: {},

    data: function () {
        if (!this.get('_data')) {
            this.set('_data', Em.A());
        }

        return this.get('_data');
    }.property(),

    rollback: function () {
        this.get('data').forEach(function (element) {
            this.set(element.key, element.orig);
        }.bind(this));
    }
});

Milo.Model.reopenClass({
    find: function (clause) {
        return this.create().find(clause);
    }
});