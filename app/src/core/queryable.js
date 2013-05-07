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