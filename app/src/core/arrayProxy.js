/**
@module milo-core
*/

/**
@class ArrayProxy
@namespace Milo
*/
Milo.ArrayProxy = Em.ArrayProxy.extend(Milo.Deferred, {
    isLoading: false,
    isError: false,
    errors: null
});