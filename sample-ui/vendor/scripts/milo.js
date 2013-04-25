//// TODO: Check fail callback
//// TODO: Extract the ajax dependencies

(function () {
    window.Milo = Ember.Namespace.create({
        revision: 1
    });
})();


(function () {
    Milo.Options = Em.Object.create({
        baseUrl: null,
        token: {
            access_token: null
        }
    });

    Milo.UriTemplate = function (template, options) {
        options = options || {};

        return function () {
            return template;
        }.property().meta(options);
    };

    Milo.Deferred = Em.Mixin.create({
        done: function (callback) {
            this.get('deferred').done(callback);
            return this;
        },
        fail: function (callback) {
            this.get('deferred').fail(callback);
            return this;
        }
    });

    Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
        isLoading: null
    });

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
            Milo.Options.get('token')));

            return $.get(url + '?' + params).always(function () {
                proxy.set('isLoading', false);
            });
        },

        resourceUrl: function () {
            var meta = this.constructor.metaForProperty('uriTemplate'),
                resourceUrl;

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

    Milo.Queryable = Em.Mixin.create({
        orderBy: function (field) {
            this.set('orderByClause', {
                orderBy: field,
                order: 'asc'
            });

            return this;
        },

        orderByDescending: function (field) {
            this.set('orderByClause', {
                orderBy: field,
                order: 'desc'
            });

            return this;
        },

        take: function (count) {
            this.set('takeClause', {
                limit: count
            });

            return this;
        },

        skip: function (count) {
            this.set('skipClause', {
                offset: count
            });

            return this;
        },

        find: function (clause) {
            this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

            return this;
        },

        single: function (callback) {
            var proxy = Milo.Proxy.create({
                deferred: $.Deferred()
            });

            this.execQuery(proxy).done(function (data) {
                //// TODO: Throw an exception if data.lenght > 1
                proxy.set('content', this.constructor.create($.extend({}, this.get('meta'), data)));

                if (typeof (callback) === 'function') {
                    proxy.done(callback.bind(proxy));
                }

                proxy.get('deferred').resolve(proxy);
            }.bind(this));

            return proxy;
        },

        toArray: function (callback) {
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

                if (typeof (callback) === 'function') {
                    proxy.done(callback.bind(proxy));
                }

                proxy.get('deferred').resolve(proxy);
            }.bind(this));

            return proxy;
        }
    });

    Milo.Model = Em.Object.extend(Milo.Queryable, Milo.DefaultAdapter, {
        meta: {}
    });

    Milo.Model.reopenClass({
        find: function (clause) {
            return this.create().find(clause);
        }
    });
})();