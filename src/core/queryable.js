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
    findMany: function () {
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
