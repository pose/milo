/**
@module milo-core
*/

/**
@class Deferred
@namespace Milo
*/
Milo.Deferred = Em.Mixin.create({
  /**
    This method will be called when the  ...

    @method done
    @return {Milo.Deferred}
  */
  done: function (callback) {
    this.get('deferred').done(callback);
    return this;
  },

  /**
    This method will be called when the  ...

    @method fail
    @return {Milo.Deferred}
  */
  fail: function (callback) {
    this.get('deferred').fail(callback);
    return this;
  }
});