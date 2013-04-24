App.Service = App.Milo.extend({
    rootElement: 'services',
    uriTemplate: App.UriTemplate('/services/%@'),

    //// TODO: Implement a has-many interface
    versions: function () {
        return App.Version.find({
            serviceId: this.get('id')
        });
    }.property().volatile() //// Avoiding Ember Cache
});