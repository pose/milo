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
