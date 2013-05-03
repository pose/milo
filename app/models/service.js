App.Service = Milo.Model.extend({
    rootElement: 'services',
    uriTemplate: '/services/:serviceId',

    name: Milo.property('string'),
    summary: Milo.property('string'),
    lastVersion: Milo.property('App.Version'),
    availableVersions: Milo.property('number'),
    taxonomies: Milo.collection('App.Taxonomy', { embedded: true }),
    versions: Milo.collection('App.Version'),

    versionId: function () {
        var lastVersion = this.get('lastVersion');
        if (lastVersion) {
            return '%@.%@.%@'.fmt(lastVersion.get('major'), lastVersion.get('minor'), lastVersion.get('revision'));
        } else {
            return '';
        }
    }.property('lastVersion')
});