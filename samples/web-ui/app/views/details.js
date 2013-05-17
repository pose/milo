var App = require('app');

App.MovieDetailsView = Ember.View.extend({
    templateName: 'details',

    didInsertElement: function () {
        this.$().find('.modal').modal();
    }
});

module.exports = App.MovieDetailsView;