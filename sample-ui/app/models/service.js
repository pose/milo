var App = require('app');

App.Service = Milo.Model.extend({
    rootElement: 'services',
    uriTemplate: Milo.UriTemplate('/services/%@'),

    //// TODO: Implement a has-many interface
    versions: function () {
        return App.Version.find({
            serviceId: this.get('id')
        });
    }.property().volatile() //// Avoiding Ember Cache)
});

module.exports = App.Service;