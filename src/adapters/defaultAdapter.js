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
    query: function (modelClass, params, queryable) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            uriTemplate = queryable.get('uriTemplate');
            urlAndQueryParams = this._splitUrlAndDataParams(modelClass, params, uriTemplate),
            resourceUrl = this._buildResourceUrl(modelClass, urlAndQueryParams.urlParams, uriTemplate),
            url = api.options('baseUrl') + resourceUrl,
            queryParams = $.param(urlAndQueryParams.dataParams),
            method = 'GET',
            deferred = $.Deferred(),
            meta = { meta: urlAndQueryParams.urlParams },
            rootElement = queryable.get('rootElement'),
            that = this;

        this._ajax(api, method, url + '?' + queryParams)
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
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.serialize(model, method);
    },

    /**
        @method _deserialize
        @private
    */
    _deserialize: function (modelClass, json) {
        var api = Milo.Helpers.apiFromModelClass(modelClass),
            serializer = api.serializer().serializerFor(modelClass);

        return serializer.deserialize(json);
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
    _ajax: function (api, method, url, data, cache) {
        var cacheFlag = (method || 'GET') === 'GET' ? cache : true,
            contentType = api.headers('Content-Type') || 'application/json';

        return jQuery.ajax({
            contentType: contentType,
            type: method || 'GET',
            dataType: (method || 'GET') === 'GET' ? 'json' : 'text',
            data: data ? JSON.stringify(data) : '',
            url: url,
            headers: {
                // XXX Unhardcode
                accept: 'application/vnd.mulesoft.habitat+json'
            },
            cache: cacheFlag
        });
    }
});
