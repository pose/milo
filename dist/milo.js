/**
    @namespace Milo
    @module milo
    @extends {Ember.Namespace}
*/
window.Milo = Em.Namespace.create({
    revision: 1
});

var _apiFromModelClass = function (modelClass) {
    var modelClassName = modelClass.toString();

    return Em.get(modelClassName.substring(0, modelClassName.indexOf('.')));
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

/**
    @namespace Milo
    @module milo-dsl
    @class property
*/
Milo.property = function (type, options) {
    options = options || {};
    options.occurrences = "one";
    options.embedded = true;
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    return _computedPropery.property().meta(options);
};

/**
    @namespace Milo
    @module milo-dsl
    @class collection
*/
Milo.collection = function (type, options) {
    options = options || {};
    options.occurrences = "many";
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
    @namespace Milo
    @module milo-core
    @class Deferred
    @extends {Ember.Mixin}
*/
Milo.Deferred = Em.Mixin.create({
  /**
    This method will be called when the ajax request has successfully finished

    @method done
    @return {Milo.Deferred}
  */
  done: function (callback) {
    this.get('deferred').done(callback);
    return this;
  },

  /**
    This method will be called when the ajax request fails

    @method fail
    @return {Milo.Deferred}
  */
  fail: function (callback) {
    this.get('deferred').fail(callback);
    return this;
  }
});
/**
    @namespace Milo
    @module milo-core
    @class Proxy
    @extends {Ember.ObjectProxy}
    @uses {Milo.Deferred}
*/
Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
    /**
        Indicates if the entity is in the 'loading' state
        
        @attribute isLoading
        @default false
        @type boolean
    */
    isLoading: false,

    /**
        Indicates if the entity is in the 'saving' state
        
        @attribute isSaving
        @default false
        @type boolean
    */
    isSaving: false,

    /**
        Indicates if the entity is in the 'deleting' state
        
        @attribute isDeleting
        @default false
        @type boolean
    */
    isDeleting: false,

    /**
        Indicates if the entity is new
        
        @attribute isNew
        @default false
        @type boolean
    */
    isNew: false,

    /**
        Indicates if the entity is in the 'dirty' state
        
        @attribute isDirty
        @default false
        @type boolean
    */
    isDirty: false,

    /**
        Indicates if the entity has errors
        
        @attribute isError
        @default false
        @type boolean
    */
    isError: false,

    /**
        @private
        @attribute errors
        @default null
        @type Array
    */
    errors: null,

    /**
        Rollbacks the current state of the entity

        @method rollback
    */
    rollback: function () {
        this.get('content').rollback();
    }
});
/**
    @namespace Milo
    @module milo-core
    @class ArrayProxy
    @extends {Ember.ArrayProxy}
    @uses {Milo.Deferred}
*/
Milo.ArrayProxy = Em.ArrayProxy.extend(Milo.Deferred, {
	/**
        Indicates if the entity is in the 'loading' state
        
        @attribute isLoading
        @default false
        @type boolean
    */
    isLoading: false,

	/**
        Indicates if the entity has errors
        
        @attribute isError
        @default false
        @type boolean
    */
    isError: false,

	/**
        @private
        @attribute errors
        @default null
        @type Array
    */
    errors: null
});
var _apiFromModelClass = function (modelClass) {
        var modelClassName = modelClass.toString();

        return Em.get(modelClassName.substring(0, modelClassName.indexOf('.')));
    };

/**
    @namespace Milo
    @module milo-adapters
    @class DefaultAdapter
    @extends {Ember.Object}
*/
Milo.DefaultAdapter = Em.Object.extend({
    /**
        @method query
        @param {String} modelClass
        @param {Array} params
    */
    query: function (modelClass, params) {
        var api = _apiFromModelClass(modelClass),
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, params),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = api.options('baseUrl') + resourceUrl,
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
                deferred.reject(arguments);
            });

        return deferred.promise();
    },

    /**
        @method save
        @param {String} modelClass
        @param {Array} params
    */
    save: function (modelClass, model) {
        var api = _apiFromModelClass(modelClass),
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = api.options('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, api.queryParams())),
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

    /**
        @method remove
        @param {String} modelClass
        @param {Array} params
    */
    remove: function (modelClass, model) {
        var api = _apiFromModelClass(modelClass),
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = api.options('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, api.queryParams())),
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

    /**
        @method _serialize
        @private
    */
    _serialize: function (modelClass, model, method) {
        var api = _apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.serialize(model, method);
    },

    /**
        @method _deserialize
        @private
    */
    _deserialize: function (modelClass, json) {
        var api = _apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.deserialize(json);
    },

    /**
        @method _buildResourceUrl
        @private
    */
    _buildResourceUrl: function (modelClass, urlParams) {
        var uriTemplate = modelClass.create().get('uriTemplate');
        if (!uriTemplate) {
            throw 'Mandatory parameter uriTemplate not set in model "' + modelClass.toString() + '"';
        }


        var urlTerms = uriTemplate.split('/');
            resourceUrl = uriTemplate;

        urlTerms.forEach(function (uriTerm) {
            var fieldName = uriTerm.replace(':', '');

            if (uriTerm.indexOf(':') === 0) {
                resourceUrl = resourceUrl.replace(uriTerm, urlParams[fieldName] || '');
            }
        });

        return resourceUrl.replace(/\/$/g, '');
    },

    /**
        @method _splitUrlAndDataParams
        @private
    */
    _splitUrlAndDataParams: function (modelClass, data) {
        var uriTemplate = modelClass.create().get('uriTemplate');
        if (!uriTemplate) {
            throw 'Mandatory parameter uriTemplate not set in model "' + modelClass.toString() + '"';
        }

        var urlTerms = uriTemplate.split('/'),
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

    /**
        @method _ajax
        @private
    */
    _ajax: function (method, url, data, cache) {
        var cacheFlag = (method || 'GET') === 'GET' ? cache : true;

        return jQuery.ajax({
            contentType: 'application/vnd.mulesoft.habitat+json',
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

/**
    @namespace Milo
    @module milo-adapters
    @class DefaultSerializer
    @extends {Ember.Object}
*/
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

    /**
        @method serializeFor
        @param {String} modelClass
    */
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

    /**
        @method _buildSerializer
        @private
    */
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
                    if (property.occurrences === 'one') {
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
Some details about milo-adapters

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
    Some details about Milo.Queryable

    @namespace Milo
    @module milo-core
    @class Queryable
    @extends {Ember.Mixin}
*/
Milo.Queryable = Em.Mixin.create({
    /**
        Adds 'asc' param to the request url
        @method orderBy
        @param {String} fieldname
        @chainable
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.orderBy('name').toArray();
    */
    orderBy: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'asc'
        });

        return this;
    },

    /**
        Adds 'desc' param to the request url

        @method orderByDescending 
        @param {String} fieldname
        @chainable
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.orderByDescending('name').toArray();
    */
    orderByDescending: function (field) {
        _validateString(field);
        this.set('orderByClause', {
            orderBy: field,
            order: 'desc'
        });

        return this;
    },

    /** 
        Adds 'limit' param to the request url

        @method take
        @param {Number} count
        @chainable
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.take(3).toArray();
    */
    take: function (count) {
        _validateNumber(count);
        this.set('takeClause', {
            limit: count
        });

        return this;
    },

    /** 
        Adds 'offset' param to the request url

        @method skip
        @param {Number} count
        @chainable
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.skip(3).toArray();
    */
    skip: function (count) {
        _validateNumber(count);
        this.set('skipClause', {
            offset: count
        });

        return this;
    },

    /** 
        Adds the filter params to the request url

        @method find 
        @param {Object} [clause]
        @chainable
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.find({name: 'Robert De Niro'}).single();
        @example
            Hollywood.Actor.find().toArray();
    */
    find: function (clause) {
        this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

        return this;
    },

    /** 
        Executes a query expecting to get a single element as a result, if not it will throw an exception

        @method single
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.find().single();
    */
    single: function () {
        return this._materialize(this.constructor, Milo.Proxy, function (deserialized) {
            return Em.isArray(deserialized) ? deserialized[0] : deserialized;
        });
    },

    /** 
        Executes a query expecting to get an array of element as a result

        @method toArray 
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.find().toArray();
    */
    toArray: function () {
        return this._materialize(this.constructor, Milo.ArrayProxy, function (deserialized) {
            return Em.isArray(deserialized) ? deserialized : Em.A([deserialized]);
        });
    },

    _getModelClass: function () {
        // XXX Hack that assumes that this is a Model Class
        return this._getAPI(this);
    },

    /**
    @method _extractParameters
    @private
    */
    _extractParameters: function () {
        var params = [];

        params.push(this.get('anyClause'));
        params.push(this.get('orderByClause'));
        params.push(this.get('takeClause'));
        params.push(this.get('skipClause'));
        
        params.push(this._getModelClass().options('auth'));

        return $.extend.apply(null, [{}].concat(params));
    },

    /**
    @method _materialize
    @private
    */
    _materialize: function (modelClass, proxyClass, extractContentFromDeserialized) {
        var params = this._extractParameters(),
            proxy = proxyClass.create({
                isLoading: true,
                errors: null,
                deferred: $.Deferred()
            }), apiFromModelClass = this._getModelClass();

        apiFromModelClass.adapter().query(modelClass, params)
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

/**
    @namespace Milo
    @module milo
    @class Model
    @extends {Ember.Object}
    @uses {Milo.Queryable}
*/
Milo.Model = Em.Object.extend(Milo.Queryable, {
    meta: Milo.property('object'),

    _getAPI: function () {
        return _apiFromModelClass(this.constructor);
    },

    /**
        @method data
    */
    data: function () {
        if (!this.get('_data')) {
            this.set('_data', Em.A());
        }

        return this.get('_data');
    }.property(),

    /**
        @method rollback
    */
    rollback: function () {
        this.get('data').forEach(function (element) {
            this.set(element.key, element.orig);
        }.bind(this));

        this.set('isDirty', false);
    },

    /**
        @method save
    */
    save: function () {
        _apiFromModelClass(this).options('defaultAdapter').save(this.constructor, this);
    },

    /**
        @method remove
    */
    remove: function () {
        _apiFromModelClass(this).get('defaultAdapter').remove(this.constructor, this);
    }
});

Milo.Model.reopenClass({
    /**
        @method find
        @static
    */
    find: function (clause) {
        return this.create().find(clause);
    }
});

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
