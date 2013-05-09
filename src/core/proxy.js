/**
    @namespace Milo
    @module milo-core
    @class Proxy
    @extends {Ember.ObjectProxy}
    @uses {Milo.Deferred}
*/
Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
    /**
        Indicates if the entity is in the 'loading' state
        
        @attribute isLoading
        @default false
        @type boolean
    */
    isLoading: false,

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

    /**
        Rollbacks the current state of the entity

        @method rollback
    */
    rollback: function () {
        this.get('content').rollback();
    }
});