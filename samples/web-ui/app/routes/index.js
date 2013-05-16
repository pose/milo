var App = require('app');

App.IndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('content', Api.Movie.where({ page_limit: 5 }).findMany());
  }
});