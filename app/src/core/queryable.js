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