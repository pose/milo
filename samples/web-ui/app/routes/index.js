var App = require('app');

App.IndexRoute = Ember.Route.extend({
    setupController: function (controller) {
        controller.set('content', Api.Movie.where({
            type: 'theaters'
        }).findMany());
    },

    events: {
        showDetails: function (movie) {
            var controller = this.controllerFor('details');

            controller.set('content', Api.Movie.where({
                id: movie.get('id')
            }).findOne());

            this.render('movieDetails', {
                into: 'index',
                outlet: 'popup',
                controller: controller
            });

            // this.$().modal();
        }
    }
});

module.exports = App.IndexRoute;