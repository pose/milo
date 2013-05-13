/**
    @namespace Milo
    @module milo-core
    @class Deferred
    @extends {Ember.Mixin}
*/
Milo.Deferred = Em.Mixin.create({
  /**
    This method will be called when the ajax request has successfully finished

    @method done
    @return {Milo.Deferred}
  */
  done: function (callback) {
    this.get('deferred').done(callback);
    return this;
  },

  /**
    This method will be called when the ajax request fails

    @method fail
    @return {Milo.Deferred}
  */
  fail: function (callback) {
    this.get('deferred').fail(callback);
    return this;
  },

  /**
   * Rhis method will be called always. Whether the ajax request fails or not.
   *
   * @method then
   * @return {Milo.Deferred}
   */
  then: function (callback) {
    this.get('deferred').then(callback);
    return this;
  }
});
