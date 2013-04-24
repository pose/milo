App.Service = App.Milo.extend({
    rootElement: 'services',
    uriTemplate: App.UriTemplate('/services/%@'),
    
    versions: function () {
        return App.Version.find({ serviceId: this.get('id') });
    }.property().volatile() //// Avoiding Ember Cache
});
