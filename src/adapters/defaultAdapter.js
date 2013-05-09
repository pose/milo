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
                console.log(Em.inspect(arguments));
                deferred.reject(arguments);
            });

        return deferred.promise();
    },

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

    /**
        @method _splitUrlAndDataParams
        @private
    */
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

    /**
        @method _ajax
        @private
    */
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
