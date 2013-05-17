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
