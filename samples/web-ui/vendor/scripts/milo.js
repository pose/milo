/**
    @namespace Milo
    @module milo
    @extends {Ember.Namespace}
*/
window.Milo = Em.Namespace.create({
    revision: 1
});


Milo.Helpers = {};

Milo.Helpers.apiFromModelClass = function (modelClass) {
    var modelClassName = modelClass.toString();
    return Em.get(modelClassName.substring(0, modelClassName.indexOf('.')));
};

Milo.Helpers.computedPropery = function () {
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
    });
};

Milo.Helpers.validateNumber = function (count) {
    if (typeof count !== 'number' || count < 0) {
        throw 'Invalid index "' + count + '"';
    }
};

Milo.Helpers.validateString = function (fieldName) {
    if (typeof fieldName !== 'string' || fieldName === '') {
        throw 'Ordering field must be a valid string';
    }
};

Milo.Helpers.baseUrlValidation = function (value) {
    var validScheme = ['http://', 'https://'].map(function (e) {
            if (value) {
                return value.indexOf(e) === 0;
            }
            return false;
        }).reduce(function (x,y) {
            return x || y;
        }, false);

    if (value && typeof value === 'string' && validScheme) {
        return value;
    }

    throw 'Protocol "' + value + '" not supported.';
};

Milo.Helpers.mapProperty = function (property, key, value) {
    if ('undefined' === typeof key) {
        return this.get(property);
    } else if ('undefined' === typeof value && 'string' === typeof key) {
        return this.get(property)[key];
    } else if ('undefined' === typeof value && 'object' === typeof key) {
        if (key.baseUrl) {
            Milo.Helpers.baseUrlValidation(key.baseUrl);
        }
        this.set(property, $.extend({}, this.get(property), key));
    } else {
        if ('baseUrl' === key) {
            Milo.Helpers.baseUrlValidation(value);
        }
        this.get(property)[key] = value;
        return value;
    }
};

Milo.Helpers.propertyWrapper = function (property, value) {
    if ('undefined' === typeof value) {
        return this.get(property);
    } else {
      this.set(property, value);
      return value;
    }
};

Milo.Helpers.defaultSerializer = {
    serialize: function (value) {
        return value;
    },

    deserialize: function (value) {
        return value;
    }
};

Milo.Helpers.booleanSerializer = {
    serialize: function (value) {
        return value ? true : false;
    },

    deserialize: function (value) {
        return value ? true : false;
    }
};
    
Milo.Helpers.numberSerializer = {
    serialize: function (value) {
        var numeric = parseFloat(value);
        return isNaN(numeric) ? 0 : numeric;
    },

    deserialize: function (value) {
        var numeric = parseFloat(value);
        return isNaN(numeric) ? 0 : numeric;
    }
};

Milo.Helpers.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

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

    return Milo.Helpers.computedPropery().property().meta(options);
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
        return Milo.Helpers.computedPropery().property().meta(options);
    } else {
        return Ember.computed(function (key, value, oldValue) {
            var parentName = this.constructor.toString(),
                param = '%@Id'.fmt(parentName.substring(parentName.indexOf('.') + 1, parentName.length)).camelize(),
                findParams = Milo.Helpers.clone(this.get('anyClause') || {}),
                queryable, uriTemplate;

            findParams[param] = findParams.id || this.get('id');
            delete findParams.id;

            type = (typeof(type) === 'string') ? Em.get(type) : type;
            queryable = type.create();
            uriTemplate = queryable.get('uriTemplate');
            queryable.set('uriTemplate', this.get('uriTemplate').replace(':id', ':' + param) + uriTemplate);

            return queryable.where(findParams);
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
  },

  /**
   * Rhis method will be called always. Whether the ajax request fails or not.
   *
   * @method then
   * @return {Milo.Deferred}
   */
  then: function (callback) {
    this.get('deferred').then(callback);
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
        
        @attribute isLoaded
        @default false
        @type boolean
    */
    isLoaded: true,

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
        
        @attribute isLoaded
        @default false
        @type boolean
    */
    isLoaded: true,

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
        @param {boolean} multiple whether it should return many results or one
    */
    query: function (modelClass, params, model,  multiple) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            uriTemplate = model.get('uriTemplate');
        urlAndQueryParams = this._splitUrlAndDataParams(modelClass, params, uriTemplate, model),
        resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams, uriTemplate),
        url = api.options('baseUrl') + resourceUrl,
        queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, api.queryParams())),
        method = 'GET',
        deferred = $.Deferred(),
        meta = {
            meta: urlAndQueryParams.urlParams
        },
        rootElement = model.get('rootElement'),
        that = this;

        this._ajax(api, method, url + '?' + queryParams)
            .done(function (data) {
                var root = data[rootElement],
                    deserialized;

                if (root && Em.isArray(root)) {
                    if (!multiple) {
                        deserialized = that._deserialize(modelClass, $.extend({}, meta, { id: root[0].id }, root[0]), model);
                    } else {
                        root.forEach(function (dataRow) {
                            model.pushObject(that._deserialize(modelClass, $.extend({}, meta, { id: dataRow.id }, dataRow)));
                        });
                    }
                } else {
                    deserialized = that._deserialize(modelClass, $.extend({}, meta, { id: data.id }, data), model);
                }

            deferred.resolve(deserialized);
        })
        .fail(function () {
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
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta'), undefined, undefined),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = api.options('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, api.queryParams())),
            method = model.get('isNew') ? 'post' : 'put',
            deferred = $.Deferred(),
            serialized;

        model.set('isSaving', true);
        serialized = this._serialize(modelClass, model, method);

        this._ajax(api, method, url + '?' + queryParams, serialized)
            .done(function (data) {
            model.set('isDirty', false);
            model.set('isNew', false);
            model.set('isSaving', false);
            deferred.resolve(model);
        })
            .fail(function () {
            model.set('errors', arguments);
            model.set('isSaving', false);
            deferred.reject(arguments);
        });

        return deferred.promise();
    },

    /**
        @method remove
        @param {String} modelClass
        @param {Array} params
    */
    remove: function (modelClass, model) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta'), undefined, model),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams),
            url = api.options('baseUrl') + resourceUrl,
            queryParams = $.param($.extend({}, urlAndQueryParams.dataParams, api.queryParams())),
            method = 'delete',
            deferred = $.Deferred();

        model.set('isDeleting', true);

        this._ajax(api, method, url + '?' + queryParams)
            .done(function (data) {
            model.set('isDirty', false);
            model.set('isDeleted', true);
            model.set('isDeleting', false);
            deferred.resolve(model);
        })
            .fail(function () {
            model.set('errors', arguments);
            model.set('isDeleting', false);
            deferred.reject(arguments);
        });

        return deferred.promise();
    },

    /**
        @method _serialize
        @private
    */
    _serialize: function (modelClass, model, method) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.serialize(model, method);
    },

    /**
        @method _deserialize
        @private
    */
    _deserialize: function (modelClass, json, model) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.deserialize(json, model);
    },

    /**
        @method _buildResourceUrl
        @private
    */
    _buildResourceUrl: function (modelClass, urlParams, uriTemplate) {
        if ('undefined' === typeof uriTemplate) {
            uriTemplate = modelClass.create().get('uriTemplate');
        }

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
    _splitUrlAndDataParams: function (modelClass, data, uriTemplate, model) {

        if ('undefined' === typeof uriTemplate) {
            uriTemplate = modelClass.create().get('uriTemplate');
        }

        if (!uriTemplate) {
            throw 'Mandatory parameter uriTemplate not set in model "%@"'.fmt(modelClass.toString());
        }

        var urlTerms = uriTemplate.split('/'),
            modelClassName = modelClass.toString(),
            modelIdField = modelClassName.substring(modelClassName.indexOf('.') + 1).camelize() + 'Id',
            urlParams = {},
            dataParams = data ? Milo.Helpers.clone(data) : {},
            dataProperties = {};

        if (model) {
            // TODO Unrepeat this code (see defaultSerializer)
            modelClass.eachComputedProperty(function (propertyName) {
                var propertyMetadata = modelClass.metaForProperty(propertyName),
                    // Model properties cannot be named any of these names
                    forbiddenProperties = ['meta', '_data'];

                if (!forbiddenProperties.contains(propertyName) && propertyMetadata.type && propertyMetadata.embedded && typeof model.get(propertyName) !== 'undefined' ) {
                    dataProperties[propertyName] = model.get(propertyName);
                }
            });
        }

        urlTerms.forEach(function (uriTerm) {
            var fieldName = uriTerm.replace(':', '');

            if (uriTerm.indexOf(':') === 0) {

                if (dataParams[fieldName] !== undefined) {
                    urlParams[fieldName] = dataParams[fieldName];
                    delete dataParams[fieldName];
                }
                
                if (dataProperties[fieldName] !== undefined) {
                    urlParams[fieldName] = dataProperties[fieldName];
                    delete dataProperties[fieldName];
                }

                if (fieldName === modelIdField && dataParams.id !== undefined) {
                    urlParams[fieldName] = dataParams.id;
                    delete dataParams.id;
                }
            }
        });

        return {
            urlParams: urlParams,
            dataParams: dataParams
        };
    },

    /**
        @method _ajax
        @private
    */
    _ajax: function (api, method, url, data, cache) {
        var cacheFlag = (method || 'GET') === 'GET' ? cache : true,
            contentType = api.headers('Content-Type') || 'application/json',
            headers = api.headers();

        return jQuery.ajax({
            contentType: contentType,
            type: method || 'GET',
            dataType: (method || 'GET') === 'GET' ? 'json' : 'text',
            data: data ? JSON.stringify(data) : '',
            url: url,
            headers: headers,
            cache: cacheFlag,
            crossDomain: true
        });
    }
});

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

        cache.set('string', Milo.Helpers.defaultSerializer);
        cache.set('object', Milo.Helpers.defaultSerializer);
        cache.set('boolean', Milo.Helpers.booleanSerializer);
        cache.set('array', Milo.Helpers.defaultSerializer);
        cache.set('number', Milo.Helpers.numberSerializer);

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
            var propertyMetadata = modelClass.metaForProperty(propertyName),
                // Model properties cannot be named any of these names
                forbiddenProperties = ['meta', '_data'];

            if (!forbiddenProperties.contains(propertyName) && propertyMetadata.type && propertyMetadata.embedded) {
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
            if (!(model && (model.constructor === modelClass ||
                            (model.constructor && model.constructor.toString && model.constructor.toString() === modelClass)))) {
                throw new Error('Error serializing instance: model is not an instance of %@'.fmt(modelClass));
            }

            var serialized = (method || 'post').toLowerCase() === 'post' ?
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

        serializer.deserialize = modelClass.deserialize || function (json, model) {
            model = model || modelClass.create();

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

/**
    Some details about Milo.Queryable

    @namespace Milo
    @module milo-core
    @class Queryable
    @extends {Ember.Mixin}
*/
Milo.Queryable = Em.Mixin.create({

    init: function () {
        this.set('anyClause', {});
    },

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
        Milo.Helpers.validateString(field);
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
        Milo.Helpers.validateString(field);
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
        Milo.Helpers.validateNumber(count);
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
        Milo.Helpers.validateNumber(count);
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
    where: function (clause) {
        this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

        return this;
    },

    /**
        Executes a query expecting to get a single element as a result, if not it will throw an exception

        @method single
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.findOne();
    */
    findOne: function () {
        return this._materialize(false);
    },

    paginate: function (params) {
        var plugin = this._intializePaginationPlugin();

        plugin.paginate(params, this);
    },

    /**
        Executes a query expecting to get an array of element as a result

        @method toArray
        @return {Milo.Queryable}
        @example
            Hollywood.Actor.find().toArray();
    */
    findMany: function () {
        return this._materialize(true);
    },

    _intializePaginationPlugin: function() {
        var options = this._getAPI(this).options('pagination'),
            plugin;

        if (!options) {
            throw 'Pagination is not configured';
        }

        options.plugin = options.plugin || Milo.DefaultPaginationPlugin;

        if ('function' !== typeof options.plugin.create) {
            throw 'Pagination plugin should be an Ember class';
        }

        plugin = options.plugin.create({ config: options.config });

        if (!Milo.PaginationPlugin.detectInstance(plugin)) {
            throw 'Pagination plugin should extend Milo.PaginationPlugin';
        }

        this.set('paginationPlugin', plugin);

        return plugin;
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

        // TODO Fail earlier if Model Class is invalid
        if (!this._getModelClass() || !this._getModelClass().options) {
            throw 'Entity was created from a Milo.API instance not registered as a global';
        }

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
    _materialize: function (multiple) {
        var modelClass = this.constructor,
            params = this._extractParameters(),
            apiFromModelClass = this._getModelClass(),
            model = this,
            deferred = $.Deferred();
        apiFromModelClass.adapter().query(modelClass, params, model, multiple)
            .fail(function (errors) {
                model.set('errors', errors);
                model.set('isError', true);
                model.set('isLoaded', true);
                deferred.reject(errors);
            })
            .done(function (deserialized) {
                model.set('isLoaded', true);
                deferred.resolve(model);
            });

        // XXX What happens after the user has done many queries? Does the reference to the 
        // deferred ever gets lost?
        model.set('deferred', deferred.promise());

        return model;
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
    //_array: Em.A(),
    content: Em.A(),
    meta: Milo.property('object'),
    /**
        Indicates if the entity is in the 'loading' state
        
        @attribute isLoaded
        @default false
        @type boolean
    */
    isLoaded: false,

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

    deferred: $.Deferred(),

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
        return Milo.Helpers.apiFromModelClass(this.constructor).adapter()
            .save(this.constructor, this);
    },

    /**
        @method remove
    */
    remove: function () {
        return Milo.Helpers.apiFromModelClass(this.constructor).adapter()
            .remove(this.constructor, this);
    },

    _getAPI: function () {
        return Milo.Helpers.apiFromModelClass(this.constructor);
    },

    done: function (f) {
        if (this.get('deferred')) {
            this.get('deferred').promise().done(f);
            return this;
        }
    },

    fail: function (f) {
        if (this.get('deferred')) {
            this.get('deferred').promise().fail(f);
            return this;
        }
    },

    always: function (f) {
        if (this.get('deferred')) {
            this.get('deferred').promise().always(f);
            return this;
        }
    },

    then: function (f) {
        if (this.get('deferred')) {
            this.get('deferred').promise().then(f);
            return this;
        }
    },

    pushObject: function(o) {
        this.get('content').pushObject(o);
    },


    objectAt: function(o) {
        return this.get('content').objectAt(o);
    }

});

Milo.Model.reopenClass({
    /**
        @method find
        @static
    */
    where: function (clause) {
        return this.create().where(clause);
    },

    findOne: function () {
        return this.create().findOne();
    },

    findMany: function () {
        return this.create().findMany();
    }
});

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

Milo.PaginationPlugin = Em.Object.extend({
    config: null,

    includePaginationParams: function (params, queryable) {

    },
    parseTotalRecordCount: function (response) {

    }
});
Milo.DefaultPaginationPlugin = Milo.PaginationPlugin.extend({

});