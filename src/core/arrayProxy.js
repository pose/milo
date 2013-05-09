/**
    @namespace Milo
    @module milo-core
    @class ArrayProxy
    @extends {Ember.ArrayProxy}
    @uses {Milo.Deferred}
*/
Milo.ArrayProxy = Em.ArrayProxy.extend(Milo.Deferred, {
	/**
        Indicates if the entity is in the 'loading' state
        
        @attribute isLoading
        @default false
        @type boolean
    */
    isLoading: false,

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
    errors: null
});