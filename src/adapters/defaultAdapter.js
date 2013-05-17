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
        urlAndQueryParams = this._splitUrlAndDataParams(modelClass, params, uriTemplate),
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
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
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
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, model.get('meta')),
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
    _splitUrlAndDataParams: function (modelClass, data, uriTemplate) {
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
            dataParams = data ? Milo.Helpers.clone(data) : {};

        urlTerms.forEach(function (uriTerm) {
            var fieldName = uriTerm.replace(':', '');

            if (uriTerm.indexOf(':') === 0) {
                console.log('delete', uriTerm, fieldName, dataParams[fieldName], data);

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
