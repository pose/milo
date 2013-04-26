  Milo.Deferred = Em.Mixin.create({
      done: function (callback) {
          this.get('deferred').done(callback);
          return this;
      },
      fail: function (callback) {
          this.get('deferred').fail(callback);
          return this;
      }
  });