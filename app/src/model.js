Milo.Model = Em.Object.extend(Milo.Queryable, Milo.DefaultAdapter, {
    meta: {},

    data: function () {
        if (!this.get('_data')) {
            this.set('_data', Em.A());
        }

        return this.get('_data');
    }.property(),

    rollback: function () {
        this.get('data').forEach(function (element) {
            this.set(element.key, element.orig);
        }.bind(this));
    }
});

Milo.Model.reopenClass({
    find: function (clause) {
        return this.create().find(clause);
    }
});