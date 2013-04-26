/**
@module milo-core
*/

/**
@class Proxy
@namespace Milo
*/
Milo.Proxy = Em.ObjectProxy.extend(Milo.Deferred, {
	isLoading: null,
	rollback: function () {
		this.content.rollback();
	}
});