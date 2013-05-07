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
var _computedPropery = Ember.computed(function (key, value, oldValue) {
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
});

Milo.property = function (type, options) {
    options = options || {};
    options.ocurrences = "one";
    options.embedded = true;
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    return _computedPropery.property().meta(options);
};

Milo.collection = function (type, options) {
    options = options || {};
    options.ocurrences = "many";
    options.embedded = options.embedded || false ? true : false;
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    if (options.embedded) {
        return _computedPropery.property().meta(options);
    } else {
        return Ember.computed(function (key, value, oldValue) {
            var parentName = this.constructor.toString(),
                param = '%@Id'.fmt(parentName.substring(parentName.indexOf('.') + 1, parentName.length)).camelize(),
                findParams = JSON.parse(JSON.stringify(this.get('anyClause') || {}));

            type = (typeof(type) === 'string') ? Em.get(type) : type;

            findParams[param] = findParams.id || this.get('id');
            delete findParams.id;

            return type.find(findParams);
        }).property().volatile().meta(options);
    }
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
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isNew: false,
    isDirty: false,
    isError: false,
    errors: null,

    rollback: function () {
        this.get('content').rollback();
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
    isLoading: false,
    isError: false,
    errors: null
});
Milo.DefaultAdapter = Em.Object.extend({
    query: function (modelClass, params) {
        var urlAndQueryParams = this._splitUrlAndDataParams(modelClass, params),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = Milo.Options.get('baseUrl') + resourceUrl,
            queryParams = $.param(urlAndQueryParams.dataParams),
            method = 'GET',
            deferred = $.Deferred(),
            meta = { meta: urlAndQueryParams.urlParams },
            rootElement = modelClass.create().get('rootElement'),
            that = this;

        this._ajax(method, url + '?' + queryParams)
            .done(function (data) {
                var root = data[rootElement],
                    deserialized;

                if (root && Em.isArray(root)) {
                    deserialized = Em.A(root.map(function (dataRow) {
                        return that._deserialize(modelClass, $.extend({}, meta, { id: dataRow.id }, dataRow));
                    }));
                } else {
                    deserialized = that._deserialize(modelClass, $.extend({}, meta, { id: data.id }, data));
                }

                deferred.resolve(deserialized);
            })
            .fail(function () {
                console.log('failed');
                console.log(Em.inspect(arguments));
                deferred.reject(arguments);
            });

        return deferred.promise();
    },

    save: function (modelClass, model) {
        var urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = Milo.Options.get('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, Milo.Options.get('auth'))),
            method = model.get('isNew') ? 'post' : 'put',
            deferred = $.Deferred(),
            serialized;

        model.set('isSaving', true);
        serialized = this._serialize(modelClass, model, method);

        this._ajax(method, url + '?' + queryParams, serialized)
            .done(function (data) {
                console.log('saved');
                model.set('isDirty', false);
                model.set('isNew', false);
                deferred.resolve(model);
            })
            .fail(function () {
                console.log('failed');
                model.set('errors', arguments);
                deferred.reject(arguments);
            })
            .always(function () {
                model.set('isSaving', false);
            });

        return deferred.promise();
    },

    remove: function (modelClass, model) {
        var urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = Milo.Options.get('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, Milo.Options.get('auth'))),
            method = 'delete',
            deferred = $.Deferred();

        model.set('isDeleting', true);

        this._ajax(method, url + '?' + queryParams)
            .done(function (data) {
                console.log('saved');
                model.set('isDirty', false);
                model.set('isDeleted', true);
                deferred.resolve(model);
            })
            .fail(function () {
                console.log('failed');
                model.set('errors', arguments);
                deferred.reject(arguments);
            })
            .always(function () {
                model.set('isDeleting', false);
            });

        return deferred.promise();
    },

    _serialize: function (modelClass, model, method) {
        var serializer = Milo.Options.get('defaultSerializer').serializerFor(modelClass);

        return serializer.serialize(model, method);
    },

    _deserialize: function (modelClass, json) {
        var serializer = Milo.Options.get('defaultSerializer').serializerFor(modelClass);

        return serializer.deserialize(json);
    },

    _buildResourceUrl: function (modelClass, urlParams) {
        var urlTemplate = modelClass.create().get('uriTemplate'),
            urlTerms = modelClass.create().get('uriTemplate').split('/');
            resourceUrl = urlTemplate;

        urlTerms.forEach(function (uriTerm) {
            var fieldName = uriTerm.replace(':', '');

            if (uriTerm.indexOf(':') === 0) {
                resourceUrl = resourceUrl.replace(uriTerm, urlParams[fieldName] || '');
            }
        });

        return resourceUrl.replace(/\/$/g, '');
    },

    _splitUrlAndDataParams: function (modelClass, data) {
        var urlTerms = modelClass.create().get('uriTemplate').split('/'),
            modelClassName = modelClass.toString(),
            modelIdField = modelClassName.substring(modelClassName.indexOf('.') + 1).camelize() + 'Id',
            urlParams = {},
            dataParams = JSON.parse(JSON.stringify(data));

        urlTerms.forEach(function (uriTerm) {
            var fieldName = uriTerm.replace(':', '');

            if (uriTerm.indexOf(':') === 0) {

                if (dataParams[fieldName] !== undefined) {
                    urlParams[fieldName] = dataParams[fieldName];
                    delete dataParams[fieldName];
                }

                if (fieldName === modelIdField && dataParams.id !== undefined) {
                    urlParams[fieldName] = dataParams.id;
                    delete dataParams.id;
                }
            }
        });

        return { urlParams: urlParams, dataParams: dataParams };
    },

    _ajax: function (method, url, data, cache) {
        var cacheFlag = (method || 'GET') === 'GET' ? cache : true;

        return jQuery.ajax({
            contentType: 'application/vnd.mulesoft.habitat+json', //TODO: Milo.Options.get('contentType'),
            type: method || 'GET',
            dataType: (method || 'GET') === 'GET' ? 'json' : 'text',
            data: data ? JSON.stringify(data) : '',
            url: url,
            headers: {
                accept: 'application/vnd.mulesoft.habitat+json'
            },
            cache: cacheFlag
        });
    }
});

var _defaultSerializer = {
        serialize: function (value) {
            return value;
        },

        deserialize: function (value) {
            return value;
        }
    },
    _booleanSerializer = {
        serialize: function (value) {
            return value ? true : false;
        },

        deserialize: function (value) {
            return value ? true : false;
        }
    },
    _numberSerializer = {
        serialize: function (value) {
            var numeric = parseFloat(value);
            return isNaN(numeric) ? 0 : numeric;
        },

        deserialize: function (value) {
            var numeric = parseFloat(value);
            return isNaN(numeric) ? 0 : numeric;
        }
    };

Milo.DefaultSerializer = Em.Object.extend({
    serializerCache: null,

    init: function () {
        var cache = Em.Map.create();

        cache.set('string', _defaultSerializer);
        cache.set('object', _defaultSerializer);
        cache.set('boolean', _booleanSerializer);
        cache.set('array', _defaultSerializer);
        cache.set('number', _numberSerializer);

        this.set('serializerCache', cache);
    },

    serializerFor: function (modelClass) {
        var cache = this.get('serializerCache'),
            serializer = cache.get(modelClass);

        if (!serializer) {
            modelClass = (typeof(modelClass) === 'string') ? Em.get(modelClass) : modelClass;
            serializer = this._buildSerializer(modelClass);
            cache.set(modelClass, serializer);
        }

        return serializer;
    },

    _buildSerializer: function (modelClass) {
        var properties = [],
            propertyNamesForPost = [],
            propertyNamesForPut = [],
            serializer = {},
            that = this;

        modelClass.eachComputedProperty(function (propertyName) {
            var propertyMetadata = modelClass.metaForProperty(propertyName);

            if (propertyMetadata.type && propertyMetadata.embedded) {
                properties.push($.extend({ name: propertyName }, propertyMetadata));
            }
        });

        properties.forEach(function (property) {
            if (property.operations.contains('post')) {
                propertyNamesForPost.push(property.name);
            }

            if (property.operations.contains('put')) {
                propertyNamesForPut.push(property.name);
            }
        });

        serializer.serialize = modelClass.serialize || function (model, method) {
            var serialized = (method || 'post').toLower() === 'post' ?
                model.getProperties(propertyNamesForPost) : model.getProperties(propertyNamesForPut);

            properties.forEach(function (property) {
                if (serialized[property.name] === undefined) {
                    serialized[property.name] = property.defaultValue;
                } else {
                    if (property.occurrences === "one") {
                        serialized[property.name] = that.serializerFor(property.type).serialize(model.get(property.name), method || 'post');
                    } else {
                        serialized[property.name] = Em.A();
                        (model.get(property.name) || []).forEach(function (item) {
                            serialized[property.name].pushObject(that.serializerFor(property.type).serialize(item, method || 'post'));
                        });
                    }
                }
            });

            return serialized;
        };

        serializer.deserialize = modelClass.deserialize || function (json) {
            var model = modelClass.create();

            properties.forEach(function (property) {
                if (json[property.name] === undefined) {
                    model.set(property.name, property.defaultValue);
                } else {
                    if (property.occurrences === "one") {
                        model.set(property.name, that.serializerFor(property.type).deserialize(json[property.name]));
                    } else {
                        model.set(property.name, Em.A());
                        (json[property.name] || []).forEach(function (item) {
                            model.get(property.name).pushObject(that.serializerFor(property.type).deserialize(item));
                        });
                    }
                }
            });

            return model;
        };

        return serializer;
    }
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
* @namespace Milo
* @class Queryable
*/
Milo.Queryable = Em.Mixin.create({
    /**
     * @method orderBy
     * @param {string} fieldname
     * @example <caption>Example usage of orderBy</caption>
     * Hollywood.Actor.orderBy('name').toArray();
     **/
    orderBy: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'asc'
        });

        return this;
    },

    /** @method orderByDescending 
     * @param {string} fieldname
     * @example <caption>Example usage of orderByDescending</caption>
     * Hollywood.Actor.orderByDescending('name').toArray();
     **/
    orderByDescending: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'desc'
        });

        return this;
    },

    /** @method take
     * @param {number} count
     * @example <caption>Example usage of take</caption>
     * Hollywood.Actor.take(3).toArray();
    **/
    take: function (count) {
        _validateNumber(count);
        this.set('takeClause', {
            limit: count
        });

        return this;
    },

    /** @method skip
     * @param {number} count
     * @example <caption>Example usage of skip</caption>
     * Hollywood.Actor.skip(3).toArray();
    **/
    skip: function (count) {
        _validateNumber(count);
        this.set('skipClause', {
            offset: count
        });

        return this;
    },

    /** @method find 
     * @param {object} clause
     * @example <caption>Example usage of find using params</caption>
     * Hollywood.Actor.find({name: 'Robert De Niro'}).single();
     * @example <caption>Example usage of find</caption>
     * Hollywood.Actor.find().toArray();
     **/
    find: function (clause) {
        this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

        return this;
    },

    /** @method single
     * @summary Single executes a query expecting to get a single element as a result, if not it will throw an exception
     * @example <caption>Example usage of find using params</caption>
     * Hollywood.Actor.find().single();
     **/
    single: function () {
        return this._materialize(this.constructor, Milo.Proxy, function (deserialized) {
            return Em.isArray(deserialized) ? deserialized[0] : deserialized;
        });
    },

    /** @method toArray 
     * @summary toArray executes a query expecting to get an array of element as a result
     * @example <caption>Example usage of find using params</caption>
     * Hollywood.Actor.find().toArray();
     **/
    toArray: function () {
        return this._materialize(this.constructor, Milo.ArrayProxy, function (deserialized) {
            return Em.isArray(deserialized) ? deserialized : Em.A([deserialized]);
        });
    },

    _extractParameters: function () {
        var params = [];

        params.push(this.get('anyClause'));
        params.push(this.get('orderByClause'));
        params.push(this.get('takeClause'));
        params.push(this.get('skipClause'));
        params.push(Milo.Options.get('auth'));

        return $.extend.apply(null, [{}].concat(params));
    },

    _materialize: function (modelClass, proxyClass, extractContentFromDeserialized) {
        var params = this._extractParameters(),
            proxy = proxyClass.create({
                isLoading: true,
                errors: null,
                deferred: $.Deferred()
            });

        Milo.Options.get('defaultDadapter').query(modelClass, params)
            .always(function () {
            proxy.set('isLoading', false);
        })
            .fail(function (errors) {
            proxy.set('errors', errors);
            proxy.set('isError', true);
            proxy.get('deferred').reject(errors);
        })
            .done(function (deserialized) {
            proxy.set('content', extractContentFromDeserialized(deserialized));
            proxy.get('deferred').resolve(proxy);
        });

        return proxy;
    }
});
Milo.Model = Em.Object.extend(Milo.Queryable, {
    meta: Milo.property('object'),

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

        this.set('isDirty', false);
    },

    save: function () {
        Milo.Options.get('defaultAdapter').save(this.constructor, this);
    },

    remove: function () {
        Milo.Options.get('defaultAdapter').remove(this.constructor, this);
    }
});

Milo.Model.reopenClass({
    find: function (clause) {
        return this.create().find(clause);
    }
});
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
