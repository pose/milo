App.Taxonomy = Milo.Model.extend({
    rootElement: 'services',
    uriTemplate: '/services/:serviceId/taxonomies/',

    taxonomy: DS.attr('string'),
    path: DS.attr('array', { defaultValue: [] }),

    fullPath: function () {
        var path = this.get('path');
        if (path && path.length) {
            return path.join(' > ');
        } else {
            return this.get('taxonomy');
        }
    }.property(),

    name: function () {
        return this.get('path.lastObject');
    }.property(),

    toString: function () {
        return this.get('id');
    }
});