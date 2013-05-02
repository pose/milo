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
        this.set('takeClause', { limit: count });

        return this;
    },

    skip: function (count) {
        _validateNumber(count);
        this.set('skipClause', { offset: count });

        return this;
    },

    find: function (clause) {
        this.set('anyClause', $.extend({}, this.get('anyClause'), clause));

        return this;
    },

    single: function () {
        return this._materialize(this.constructor, Milo.Proxy, function (deserialized) {
            return Em.isArray(deserialized) ? deserialized[0] : deserialized;
        });
    },

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
