var App = require('app');

App.IndexController = Ember.ArrayController.extend({
    filter: function (query) {
        this.set('content', Api.Movie.where(query).findMany());
    }
});

module.exports = App.IndexController;