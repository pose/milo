/**
    @namespace Milo
    @module milo
    @class Model
    @extends {Ember.Object}
    @uses {Milo.Queryable}
*/
Milo.Model = Em.Object.extend(Milo.Queryable, {
    meta: Milo.property('object'),

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
        Milo.Options.get('defaultAdapter').save(this.constructor, this);
    },

    /**
        @method remove
    */
    remove: function () {
        Milo.Options.get('defaultAdapter').remove(this.constructor, this);
    }
});

Milo.Model.reopenClass({
    /**
        @method find
        @static
    */
    find: function (clause) {
        return this.create().find(clause);
    }
});