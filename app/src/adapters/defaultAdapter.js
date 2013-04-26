Milo.DefaultAdapter = Em.Mixin.create({
    execQuery: function (proxy) {
        var params,
        url = Milo.Options.get('baseUrl').fmt(this.get('resourceUrl'));

        proxy.set('isLoading', true);

        params = $.param($.extend({},
        this.get('orderByClause'),
        this.get('anyClause'),
        this.get('takeClause'),
        Milo.Options.get('auth')));

        return $.get(url + '?' + params).always(function () {
            proxy.set('isLoading', false);
        });
    },

    resourceUrl: function () {
        var meta = this.constructor.metaForProperty('uriTemplate'),
            resourceUrl;

        if (meta.namedParams) {
            var params = [];

            meta.namedParams.forEach(function (param) {
                if (this.get('anyClause')[param]) {
                    params.push(this.get('anyClause')[param]);

                    this.get('meta')[param] = this.get('anyClause')[param];

                    delete this.get('anyClause')[param];
                }
            }.bind(this));

            resourceUrl = Em.String.fmt(this.get('uriTemplate'), params);
        } else if (this.get('anyClause').id) {
            resourceUrl = this.get('uriTemplate').fmt(this.get('anyClause').id);
            delete this.get('anyClause').id;
        } else {
            resourceUrl = this.get('uriTemplate').fmt();
        }

        if (resourceUrl.charAt(resourceUrl.length - 1) === '/') {
            resourceUrl = resourceUrl.substring(resourceUrl.length - 1, 0);
        }

        return resourceUrl;
    }.property().volatile()
});

var _validateNumber = function (count) {
    if (typeof count !== 'number' || count < 0) {
        throw 'Invalid index "' + count + '"';
    }
};