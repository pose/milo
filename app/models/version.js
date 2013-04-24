App.Version = App.Milo.extend({
    rootElement: 'versions',
    uriTemplate: App.UriTemplate('/services/%@/versions/%@', {
        namedParams: ['serviceId', 'versionId']
    }),

    tiers: function () {
        return App.VersionTier.find({ serviceId: this.get('serviceId'), versionId: this.get('versionId') });
    }.property().volatile() //// Avoiding Ember Cache
});