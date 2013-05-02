/**
@module milo-core
*/

/**
@class Proxy
@namespace Milo
*/
Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isNew: false,
    isDirty: false,
    isError: false,
    errors: null,

    rollback: function () {
        this.get('content').rollback();
    }
});