App.Version = Milo.Model.extend({
    rootElement: 'versions',
    uriTemplate: '/services/:serviceId/versions/:versionId',

    major: Milo.property('number'),
    minor: Milo.property('number'),
    revision: Milo.property('string'),
    rating: Milo.property('number'),
    releaseNotes: Milo.property('string', { defaultValue: '' }),

    fullVersion: function () {
        return '%@.%@.%@'.fmt(this.get('major'), this.get('minor'), this.get('revision'));
    }.property('major', 'minor', 'revision'),

    tiers: function () {
        return App.VersionTier.find({
            serviceId: this.get('serviceId'),
            versionId: this.get('versionId')
        });
    }.property().volatile() //// Avoiding Ember Cache,
});